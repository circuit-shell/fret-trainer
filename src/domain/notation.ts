import type { NoteIndex } from './notes'

export type NotationSystem = 'letter' | 'solfege'

export const DEFAULT_NOTATION: NotationSystem = 'letter'

const LETTER_SHARPS: readonly string[] = [
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
]
const LETTER_FLATS: readonly string[] = [
  'C',
  'Db',
  'D',
  'Eb',
  'E',
  'F',
  'Gb',
  'G',
  'Ab',
  'A',
  'Bb',
  'B',
]

// Solfège names mapped to chromatic indices. Spanish/Italian convention.
const SOLFEGE_SHARPS: readonly string[] = [
  'Do',
  'Do#',
  'Re',
  'Re#',
  'Mi',
  'Fa',
  'Fa#',
  'Sol',
  'Sol#',
  'La',
  'La#',
  'Si',
]
const SOLFEGE_FLATS: readonly string[] = [
  'Do',
  'Reb',
  'Re',
  'Mib',
  'Mi',
  'Fa',
  'Solb',
  'Sol',
  'Lab',
  'La',
  'Sib',
  'Si',
]

export function sharpNameIn(notation: NotationSystem, index: NoteIndex): string {
  return notation === 'solfege' ? SOLFEGE_SHARPS[index] : LETTER_SHARPS[index]
}

export function flatNameIn(notation: NotationSystem, index: NoteIndex): string {
  return notation === 'solfege' ? SOLFEGE_FLATS[index] : LETTER_FLATS[index]
}

// Full per-pitch name pool. Each NoteIndex maps to 1 or 2 names — the natural
// or sharp form first, the enharmonic alternate (if any) second. Index into
// this with `slot` from a RoundState to get the currently-displayed name.
// Both notations have identical structure (same count per index) so slot 1
// always means "the alternate" regardless of notation.
const LETTER_NAMES: ReadonlyArray<readonly string[]> = Object.freeze([
  ['C', 'B#'],
  ['C#', 'Db'],
  ['D'],
  ['D#', 'Eb'],
  ['E', 'Fb'],
  ['F', 'E#'],
  ['F#', 'Gb'],
  ['G'],
  ['G#', 'Ab'],
  ['A'],
  ['A#', 'Bb'],
  ['B', 'Cb'],
])

const SOLFEGE_NAMES: ReadonlyArray<readonly string[]> = Object.freeze([
  ['Do', 'Si#'],
  ['Do#', 'Reb'],
  ['Re'],
  ['Re#', 'Mib'],
  ['Mi', 'Fab'],
  ['Fa', 'Mi#'],
  ['Fa#', 'Solb'],
  ['Sol'],
  ['Sol#', 'Lab'],
  ['La'],
  ['La#', 'Sib'],
  ['Si', 'Dob'],
])

/** All valid names for the given pitch in the given notation. Length is
 * either 1 (D, G, A) or 2 (everything else). */
export function namesAt(notation: NotationSystem, index: NoteIndex): readonly string[] {
  return notation === 'solfege' ? SOLFEGE_NAMES[index] : LETTER_NAMES[index]
}

/** Resolve a single name. `slot` 0 is the primary (natural / sharp); slot 1
 * is the alternate (enharmonic / flat) if it exists. Out-of-range slots
 * fall back to slot 0. */
export function nameAt(notation: NotationSystem, index: NoteIndex, slot: number): string {
  const names = namesAt(notation, index)
  return names[slot] ?? names[0]
}

/** How many valid names exist for the given pitch (1 or 2). Notation-
 * independent — both letter and solfège have the same shape. */
export function slotCount(index: NoteIndex): number {
  return LETTER_NAMES[index].length
}

// Display label: single name for white keys (where sharp == flat), the
// stacked "sharp/flat" form for black keys.
export function displayLabelIn(notation: NotationSystem, index: NoteIndex): string {
  const sharp = sharpNameIn(notation, index)
  const flat = flatNameIn(notation, index)
  return sharp === flat ? sharp : `${sharp}/${flat}`
}

// Enharmonic alternates for the four white keys that have one — each natural
// note that sits a half-step away from another natural with no black key in
// between:
//   C (idx 0)  ← B# (B + 1 semitone)
//   E (idx 4)  → Fb (F − 1 semitone)
//   F (idx 5)  ← E# (E + 1 semitone)
//   B (idx 11) → Cb (C − 1 semitone)
// Other white keys (D, G, A) have no useful alternate because each chromatic
// step adjacent to them is a black key with its own labels.
// Returns null for any noteIndex that isn't one of the four white keys above.
export function enharmonicAlternateIn(
  notation: NotationSystem,
  index: NoteIndex,
): string | null {
  if (notation === 'solfege') {
    if (index === 0) return 'Si#'
    if (index === 4) return 'Fab'
    if (index === 5) return 'Mi#'
    if (index === 11) return 'Dob'
    return null
  }
  // letter notation
  if (index === 0) return 'B#'
  if (index === 4) return 'Fb'
  if (index === 5) return 'E#'
  if (index === 11) return 'Cb'
  return null
}
