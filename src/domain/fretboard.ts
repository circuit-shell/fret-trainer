import type { NoteIndex } from './notes'

export type StringNumber = 1 | 2 | 3 | 4 | 5 | 6

export interface FretboardPosition {
  readonly string: StringNumber
  readonly fret: number
}

export const OPEN_STRING_NOTE_INDEX: Readonly<Record<StringNumber, NoteIndex>> = Object.freeze({
  1: 4, // high E
  2: 11, // B
  3: 7, // G
  4: 2, // D
  5: 9, // A
  6: 4, // low E
})

export function noteAt(pos: FretboardPosition): NoteIndex {
  return ((OPEN_STRING_NOTE_INDEX[pos.string] + pos.fret) % 12) as NoteIndex
}

// MIDI numbers for each open string under standard tuning (E2 A2 D3 G3 B3 E4).
// Used only by the audio engine; the existing noteAt() above still serves the
// pitch-class-only correctness check for the round logic.
const OPEN_STRING_MIDI: Readonly<Record<StringNumber, number>> = Object.freeze({
  6: 40, // E2
  5: 45, // A2
  4: 50, // D3
  3: 55, // G3
  2: 59, // B3
  1: 64, // E4
})

export function pitchOfPosition(pos: FretboardPosition): {
  noteIndex: NoteIndex
  octave: number
} {
  const midi = OPEN_STRING_MIDI[pos.string] + pos.fret
  const noteIndex = (((midi % 12) + 12) % 12) as NoteIndex
  const octave = Math.floor(midi / 12) - 1
  return { noteIndex, octave }
}

export function positionsEqual(a: FretboardPosition, b: FretboardPosition): boolean {
  return a.string === b.string && a.fret === b.fret
}

export interface ReferenceMarker {
  readonly position: FretboardPosition
  readonly label: 'A' | 'D' | 'G' | 'B' | 'E'
}

export const REFERENCE_MARKERS: readonly ReferenceMarker[] = Object.freeze([
  { position: { string: 6, fret: 5 }, label: 'A' },
  { position: { string: 5, fret: 5 }, label: 'D' },
  { position: { string: 4, fret: 5 }, label: 'G' },
  { position: { string: 3, fret: 4 }, label: 'B' },
  { position: { string: 2, fret: 5 }, label: 'E' },
  { position: { string: 1, fret: 5 }, label: 'A' },
])

export const MAX_FRET_MOBILE = 12
export const MAX_FRET_DESKTOP = 24

// Logical iteration order: low E → high E. Used by the round reducer and any code
// that walks strings in pitch order. UNCHANGED from feature 001.
export const STRING_NUMBERS: readonly StringNumber[] = Object.freeze([6, 5, 4, 3, 2, 1])

// Visual top-to-bottom row order under the new orientation (feature 002): string 1
// (high E) at the top, string 6 (low E) at the bottom. Consumed only by Fretboard.tsx
// and tests that assert on visual order.
export const DISPLAY_STRING_ORDER: readonly StringNumber[] = Object.freeze([1, 2, 3, 4, 5, 6])
