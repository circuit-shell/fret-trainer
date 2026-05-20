import type { NoteIndex } from './notes'
import { pitchOfPosition, type FretboardPosition } from './fretboard'

declare global {
  interface Window {
    __audioEngine?: AudioEngine
  }
}

export const PIANO_OCTAVE = 3 as const

export interface AudioEngine {
  ensureReady(): Promise<void>
  playPiano(noteIndex: NoteIndex): void
  playGuitar(pos: FretboardPosition): void
  isReady(): boolean
  isUnavailable(): boolean
  /** Monotonic counter incremented at the *entry* of each play* call. E2E uses
   * this to assert "a tap did or did not attempt to trigger audio" without
   * depending on whether the Tone.js chunk actually loaded. */
  readonly playCount: number
  /** True once the sampled piano AND guitar instruments have finished loading
   * their MP3s. Before both fire, taps are queued and flush on the matching
   * onload. There is no synth fallback in this version — the user explicitly
   * wants consistent sampled audio. */
  samplersReady(): boolean
}

// Sharp spellings for the 12 chromatic pitch classes. The audio engine is
// indifferent to flat-vs-sharp display; pitch identity is unambiguous either
// way. Tone.js note strings concatenate name + octave (e.g., "F#4").
const SHARP_NAMES = [
  'C',
  'C#',
  'D',
  'D#',
  'E',
  'F',
  'F#',
  'G',
  'G#',
  'A',
  'A#',
  'B',
] as const

function noteNameFor(noteIndex: NoteIndex, octave: number): string {
  return `${SHARP_NAMES[noteIndex]}${octave}`
}

// Minimal structural type for the sampler instances we use. We only depend
// on triggerAttackRelease; the engine intentionally avoids any other Tone.js
// API so unit-test mocks can stay small.
interface ToneVoiceLike {
  triggerAttackRelease(note: string, duration: string, time?: number): unknown
}

interface SamplerCtor {
  new (options: { minify?: boolean; onload?: () => void }): ToneVoiceLike & {
    connect(target: unknown): unknown
  }
}

// Internal mutable state. Encapsulated so __resetForTest can clear it.
interface EngineState {
  // Tone.js module reference. Null until preloadTone() resolves.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ToneMod: any
  preloadPromise: Promise<void> | null
  initPromise: Promise<void> | null
  samplersConstructedPromise: Promise<void> | null
  /** True once Tone module is loaded AND audio nodes (masterGain + samplers)
   * have been constructed. Construction triggers MP3 download but does NOT
   * require a user gesture — Tone.js works on a suspended AudioContext. */
  nodesCreated: boolean
  /** True once Tone.start() has been called from a user gesture. Resuming the
   * AudioContext requires this; we dedupe so it only happens once per session. */
  activated: boolean
  unavailable: boolean
  pianoSampler: ToneVoiceLike | null
  guitarSampler: ToneVoiceLike | null
  masterGain: unknown
  toneNow: (() => number) | null
  playCount: number
  queued: Array<() => void>
}

const state: EngineState = {
  ToneMod: null,
  preloadPromise: null,
  initPromise: null,
  samplersConstructedPromise: null,
  nodesCreated: false,
  activated: false,
  unavailable: false,
  pianoSampler: null,
  guitarSampler: null,
  masterGain: null,
  toneNow: null,
  playCount: 0,
  queued: [],
}

/** Preload the Tone.js module. Idempotent. Does NOT touch the AudioContext —
 * `Tone.start()` (which calls `audioContext.resume()`) is reserved for the
 * user-gesture path inside `activateInGesture`. */
function preloadTone(): Promise<void> {
  if (state.preloadPromise) return state.preloadPromise
  state.preloadPromise = (async () => {
    try {
      state.ToneMod = await import('tone')
    } catch {
      state.unavailable = true
    }
  })()
  return state.preloadPromise
}

function createNodes(): void {
  if (state.nodesCreated || !state.ToneMod) return
  const Tone = state.ToneMod

  // Master gain — comfortable fixed level per spec Assumptions ("no volume
  // slider in v1; user controls volume via device").
  // Note: Tone.js creates a suspended AudioContext lazily here. The browser
  // does NOT log an "AudioContext not allowed to start" warning for creation
  // alone — only resumption requires a user gesture, and we defer that to
  // activateInGesture.
  const masterGain = new Tone.Gain(0.6).toDestination()
  state.masterGain = masterGain
  state.toneNow = () => Tone.now()
  state.nodesCreated = true

  // Kick off sampler construction and MP3 download. The download proceeds on
  // the suspended AudioContext; once user activates (taps), Tone.start()
  // resumes and any queued or scheduled events play. We expose the
  // construction promise so ensureReady can await it (and so unit tests can
  // observe the constructed samplers deterministically).
  state.samplersConstructedPromise = loadSamplers()
}

async function loadSamplers(): Promise<void> {
  try {
    const [pianoMod, guitarMod] = await Promise.all([
      import('tonejs-instrument-piano-mp3'),
      import('tonejs-instrument-guitar-acoustic-mp3'),
    ])
    const PianoSampler = pianoMod.default as unknown as SamplerCtor
    const piano = new PianoSampler({
      minify: true, // 9 sparse samples instead of all 88 — Tone pitches the rest in software
      onload: () => {
        state.pianoSampler = piano
        // A piano-key tap may have been queued before MP3 decode completed.
        flushQueue()
      },
    })
    piano.connect(state.masterGain)
    const GuitarSampler = guitarMod.default as unknown as SamplerCtor
    const guitar = new GuitarSampler({
      minify: true,
      onload: () => {
        state.guitarSampler = guitar
        flushQueue()
      },
    })
    guitar.connect(state.masterGain)
  } catch {
    // Sample MP3s couldn't be fetched. Engine stays silent; the rest of the
    // app keeps working (FR-012 graceful degradation).
  }
}

function flushQueue(): void {
  const drain = state.queued.slice()
  state.queued.length = 0
  for (const f of drain) {
    try {
      f()
    } catch {
      // Best-effort: a bad queued call shouldn't break later good ones.
    }
  }
}

/** Activate the audio engine. MUST be called *synchronously* from inside a
 * user gesture's call stack — the synchronous `Tone.start()` call is what
 * the browser credits to the gesture, even though the returned promise
 * resolves later. Deduped via `state.activated` so subsequent gesture calls
 * are no-ops. */
function activateInGesture(): void {
  if (state.unavailable || state.activated) return
  if (!state.ToneMod) {
    // Tone hasn't loaded yet (user toggled Sound on and tapped before the
    // warmup useEffect's import resolved). Kick off the load; the next tap
    // will succeed once the module is loaded.
    void preloadTone()
    return
  }
  state.activated = true
  // SYNC call — the browser sees this in the gesture stack and grants
  // audioContext.resume() permission. The returned promise resolves later.
  ;(state.ToneMod.start() as Promise<void>)
    .then(() => {
      if (!state.nodesCreated) createNodes()
      flushQueue()
    })
    .catch(() => {
      state.activated = false
      state.unavailable = true
    })
}

function schedulePiano(noteIndex: NoteIndex): void {
  if (state.unavailable) return
  if (state.pianoSampler && state.toneNow) {
    state.pianoSampler.triggerAttackRelease(
      noteNameFor(noteIndex, PIANO_OCTAVE),
      '1s',
      state.toneNow(),
    )
  } else {
    // Sampler MP3s haven't loaded yet — queue the tap. When the piano onload
    // fires (loadSamplers above), flushQueue replays this scheduled call.
    state.queued.push(() => schedulePiano(noteIndex))
  }
}

function scheduleGuitar(pos: FretboardPosition): void {
  if (state.unavailable) return
  if (state.guitarSampler && state.toneNow) {
    const { noteIndex, octave } = pitchOfPosition(pos)
    state.guitarSampler.triggerAttackRelease(
      noteNameFor(noteIndex, octave),
      '1s',
      state.toneNow(),
    )
  } else {
    state.queued.push(() => scheduleGuitar(pos))
  }
}

export const audioEngine: AudioEngine = {
  // Preloads Tone.js and constructs the audio nodes (master gain + samplers).
  // Sample MP3 download starts as soon as the samplers are constructed — on
  // a suspended AudioContext, which is allowed by browsers without a gesture.
  // The first user gesture (via playPiano/playGuitar) then resumes the
  // context, and any taps that landed before the samples were ready get
  // flushed from the queue.
  async ensureReady(): Promise<void> {
    if (state.unavailable) return
    if (state.initPromise) return state.initPromise
    state.initPromise = (async () => {
      await preloadTone()
      if (state.unavailable || !state.ToneMod) return
      createNodes()
      // Wait for the sampler instances to be constructed (their MP3 onloads
      // fire later, asynchronously, when MP3 decode completes). This lets
      // ensureReady() callers know the engine is structurally ready.
      if (state.samplersConstructedPromise) {
        try {
          await state.samplersConstructedPromise
        } catch {
          // Sample construction failed — engine stays silent. Not "unavailable".
        }
      }
    })()
    return state.initPromise
  },

  playPiano(noteIndex: NoteIndex): void {
    state.playCount++
    if (state.unavailable) return
    activateInGesture()
    schedulePiano(noteIndex)
  },

  playGuitar(pos: FretboardPosition): void {
    state.playCount++
    if (state.unavailable) return
    activateInGesture()
    scheduleGuitar(pos)
  },

  isReady(): boolean {
    return state.nodesCreated
  },

  isUnavailable(): boolean {
    return state.unavailable
  },

  get playCount(): number {
    return state.playCount
  },

  samplersReady(): boolean {
    return state.pianoSampler !== null && state.guitarSampler !== null
  },
}

// Test seam: expose the engine on `window.__audioEngine` in non-production
// builds so Playwright E2E can inspect engine state without depending on a
// `window.Tone` global (Tone.js does NOT auto-attach itself under ES-module
// import).
if (
  typeof window !== 'undefined' &&
  import.meta.env.MODE !== 'production'
) {
  window.__audioEngine = audioEngine
}

/** Test-only reset hook. Clears engine state so unit tests can exercise the
 * state machine across cases. Guarded against accidental production use by
 * the non-production export pattern (callers must explicitly import it). */
export function __resetForTest(): void {
  state.ToneMod = null
  state.preloadPromise = null
  state.initPromise = null
  state.samplersConstructedPromise = null
  state.nodesCreated = false
  state.activated = false
  state.unavailable = false
  state.pianoSampler = null
  state.guitarSampler = null
  state.masterGain = null
  state.toneNow = null
  state.playCount = 0
  state.queued = []
}
