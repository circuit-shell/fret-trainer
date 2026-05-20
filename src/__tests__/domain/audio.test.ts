import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock Tone.js at the module boundary so unit tests can run in jsdom without
// a real AudioContext. The mock records every triggerAttackRelease call so
// assertions can inspect what the engine asked the synths to play.
//
// Shared control object so tests can swap out the start() implementation
// after import. Using a property on a stable object (rather than reassigning
// a `let` binding) sidesteps closure/hoisting surprises in vi.mock factories.
const toneCtrl: { startImpl: () => Promise<void> } = {
  startImpl: () => Promise.resolve(),
}

const triggerAttackReleaseCalls: Array<{
  voice: 'piano' | 'guitar'
  note: string
  duration: string
  time: number | undefined
}> = []

class FakeGain {
  toDestination(): FakeGain {
    return this
  }
  connect(): FakeGain {
    return this
  }
}

vi.mock('tone', () => ({
  start: () => toneCtrl.startImpl(),
  now: () => 0,
  Gain: FakeGain,
  // The per-instrument sample packages do `import {Sampler} from 'tone'` —
  // they `extends Sampler` at module-eval time, so the mock must provide it.
  Sampler: class {},
}))

// Mock the sampled-instrument packages so unit tests run in jsdom without
// trying to decode real MP3s. Each fake sampler exposes `triggerAttackRelease`
// and exposes its `onload` callback via samplerCtrl so tests can fire it on
// demand.
const samplerCtrl: {
  pianoOnloads: Array<() => void>
  guitarOnloads: Array<() => void>
} = { pianoOnloads: [], guitarOnloads: [] }

class FakePianoSampler {
  triggerAttackRelease(note: string, duration: string, time?: number): void {
    triggerAttackReleaseCalls.push({ voice: 'piano', note, duration, time })
  }
  connect(): FakePianoSampler {
    return this
  }
  constructor(opts: { minify?: boolean; onload?: () => void }) {
    if (opts.onload) samplerCtrl.pianoOnloads.push(opts.onload)
  }
}

class FakeGuitarSampler {
  triggerAttackRelease(note: string, duration: string, time?: number): void {
    triggerAttackReleaseCalls.push({ voice: 'guitar', note, duration, time })
  }
  connect(): FakeGuitarSampler {
    return this
  }
  constructor(opts: { minify?: boolean; onload?: () => void }) {
    if (opts.onload) samplerCtrl.guitarOnloads.push(opts.onload)
  }
}

vi.mock('tonejs-instrument-piano-mp3', () => ({ default: FakePianoSampler }))
vi.mock('tonejs-instrument-guitar-acoustic-mp3', () => ({ default: FakeGuitarSampler }))

import { audioEngine, __resetForTest, PIANO_OCTAVE } from '../../domain/audio'

beforeEach(() => {
  __resetForTest()
  triggerAttackReleaseCalls.length = 0
  toneCtrl.startImpl = () => Promise.resolve()
  samplerCtrl.pianoOnloads = []
  samplerCtrl.guitarOnloads = []
})

// Helper: ensureReady now awaits sampler construction internally, so after it
// resolves the FakePianoSampler/FakeGuitarSampler onload callbacks are in
// samplerCtrl and ready to fire.
async function readyAndConstructSamplers(): Promise<void> {
  await audioEngine.ensureReady()
}

describe('audioEngine', () => {
  it('exposes the piano octave the on-screen keyboard sounds at (3 — one octave below middle C)', () => {
    expect(PIANO_OCTAVE).toBe(3)
  })

  it('ensureReady() preloads Tone exactly once and does NOT call Tone.start (start is reserved for the user-gesture path)', async () => {
    const startSpy = vi.fn().mockResolvedValue(undefined)
    toneCtrl.startImpl = () => startSpy()

    await audioEngine.ensureReady()
    await audioEngine.ensureReady()
    await audioEngine.ensureReady()

    expect(startSpy).toHaveBeenCalledTimes(0)
    expect(audioEngine.isReady()).toBe(true)
    expect(audioEngine.isUnavailable()).toBe(false)
  })

  it('multiple play* calls call Tone.start exactly once (activateInGesture dedupes)', async () => {
    const startSpy = vi.fn().mockResolvedValue(undefined)
    toneCtrl.startImpl = () => startSpy()

    await readyAndConstructSamplers()
    samplerCtrl.pianoOnloads[0]()
    samplerCtrl.guitarOnloads[0]()

    audioEngine.playPiano(0)
    audioEngine.playPiano(4)
    audioEngine.playGuitar({ string: 6, fret: 3 })

    expect(startSpy).toHaveBeenCalledTimes(1)
  })

  it('playPiano(6) schedules "F#3" on the piano sampler (after onload fires)', async () => {
    await readyAndConstructSamplers()
    samplerCtrl.pianoOnloads[0]()

    audioEngine.playPiano(6)
    expect(triggerAttackReleaseCalls).toHaveLength(1)
    expect(triggerAttackReleaseCalls[0]).toMatchObject({
      voice: 'piano',
      note: 'F#3',
      duration: '1s',
    })
  })

  it('playGuitar({string:6, fret:3}) schedules "G2" on the guitar sampler (after onload fires)', async () => {
    await readyAndConstructSamplers()
    samplerCtrl.guitarOnloads[0]()

    audioEngine.playGuitar({ string: 6, fret: 3 })
    expect(triggerAttackReleaseCalls).toHaveLength(1)
    expect(triggerAttackReleaseCalls[0]).toMatchObject({
      voice: 'guitar',
      note: 'G2',
      duration: '1s',
    })
  })

  it('taps captured before samplers load get flushed when each respective onload fires', async () => {
    await readyAndConstructSamplers()

    // Tap before samplers have loaded — these queue.
    audioEngine.playPiano(0) // C3
    audioEngine.playGuitar({ string: 1, fret: 0 }) // E4
    expect(triggerAttackReleaseCalls).toHaveLength(0)

    // Fire piano onload — the queued piano tap drains and plays. The queued
    // guitar tap re-queues itself (guitar sampler still null).
    samplerCtrl.pianoOnloads[0]()
    expect(triggerAttackReleaseCalls).toHaveLength(1)
    expect(triggerAttackReleaseCalls[0]).toMatchObject({ voice: 'piano', note: 'C3' })

    // Fire guitar onload — the re-queued guitar tap drains and plays.
    samplerCtrl.guitarOnloads[0]()
    expect(triggerAttackReleaseCalls).toHaveLength(2)
    expect(triggerAttackReleaseCalls[1]).toMatchObject({ voice: 'guitar', note: 'E4' })
  })

  it('FR-009 polyphony: two rapid playPiano calls produce two distinct triggerAttackRelease calls (no early release)', async () => {
    await readyAndConstructSamplers()
    samplerCtrl.pianoOnloads[0]()

    audioEngine.playPiano(0) // C3
    audioEngine.playPiano(4) // E3

    expect(triggerAttackReleaseCalls).toHaveLength(2)
    expect(triggerAttackReleaseCalls.map((c) => c.note)).toEqual(['C3', 'E3'])
  })

  it('playCount increments on every play* call, regardless of sampler readiness', () => {
    expect(audioEngine.playCount).toBe(0)
    audioEngine.playPiano(0)
    audioEngine.playPiano(4)
    audioEngine.playGuitar({ string: 6, fret: 3 })
    expect(audioEngine.playCount).toBe(3)
  })

  it('samplersReady() returns true only after BOTH piano and guitar onloads fire', async () => {
    await readyAndConstructSamplers()
    expect(audioEngine.samplersReady()).toBe(false)

    samplerCtrl.pianoOnloads[0]()
    expect(audioEngine.samplersReady()).toBe(false)

    samplerCtrl.guitarOnloads[0]()
    expect(audioEngine.samplersReady()).toBe(true)
  })

  it('if samplers never load (e.g., MP3 fetch blocked), taps queue silently — engine is not "unavailable" and the rest of the app keeps working (FR-012)', async () => {
    await readyAndConstructSamplers()
    // Deliberately do NOT fire any onloads — simulates network-blocked MP3s.

    audioEngine.playPiano(0)
    audioEngine.playGuitar({ string: 6, fret: 3 })

    expect(triggerAttackReleaseCalls).toHaveLength(0)
    expect(audioEngine.isUnavailable()).toBe(false)
    expect(audioEngine.playCount).toBe(2)
  })

  it('a forced rejection of Tone.start() (via activateInGesture) flips isUnavailable() and silences play*', async () => {
    toneCtrl.startImpl = () => Promise.reject(new Error('audio unavailable'))

    await readyAndConstructSamplers()
    expect(audioEngine.isUnavailable()).toBe(false) // ensureReady doesn't call start

    audioEngine.playPiano(0)
    // The rejection from activateInGesture's Tone.start chain is microtask-scheduled.
    await Promise.resolve()
    await Promise.resolve()

    expect(audioEngine.isUnavailable()).toBe(true)

    // Subsequent plays don't schedule even if samplers later load.
    samplerCtrl.pianoOnloads[0]()
    audioEngine.playPiano(4)
    expect(triggerAttackReleaseCalls).toHaveLength(0)
  })
})
