import { useEffect, useMemo } from 'react'
import { audioEngine } from '../domain/audio'
import type { FretboardPosition } from '../domain/fretboard'
import type { NoteIndex } from '../domain/notes'

export interface AudioBindings {
  playPiano: (noteIndex: NoteIndex) => void
  playGuitar: (pos: FretboardPosition) => void
}

const NOOP_BINDINGS: AudioBindings = Object.freeze({
  playPiano: () => {},
  playGuitar: () => {},
})

const REAL_BINDINGS: AudioBindings = Object.freeze({
  playPiano: (n: NoteIndex) => audioEngine.playPiano(n),
  playGuitar: (p: FretboardPosition) => audioEngine.playGuitar(p),
})

/** Returns memoized audio callbacks. When `soundEnabled` is false, both
 * callbacks are no-ops — Tone.js is never loaded and nothing is heard. When
 * `soundEnabled` is true, callbacks delegate to the audio-engine singleton.
 *
 * On every false→true transition this hook also kicks off
 * `audioEngine.ensureReady()` as a best-effort warmup so the next tap finds
 * the engine already loaded. First-tap correctness does NOT depend on the
 * warmup — the engine queues taps it receives before `READY` (see research
 * R2/R5 and audio.ts `state.queued`). */
export function useAudioEngine(soundEnabled: boolean): AudioBindings {
  useEffect(() => {
    if (soundEnabled) {
      void audioEngine.ensureReady()
    }
  }, [soundEnabled])

  // Frozen singletons keep referential identity stable across renders so
  // child components don't re-render spuriously when the parent re-renders.
  return useMemo(
    () => (soundEnabled ? REAL_BINDINGS : NOOP_BINDINGS),
    [soundEnabled],
  )
}
