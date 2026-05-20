import type { NoteIndex } from './notes'

export type WhiteKeyName = 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B'

export interface WhiteKey {
  readonly name: WhiteKeyName
  readonly noteIndex: NoteIndex
  readonly slot: 0 | 1 | 2 | 3 | 4 | 5 | 6
}

export type BlackKeySharpName = 'C#' | 'D#' | 'F#' | 'G#' | 'A#'
export type BlackKeyFlatName = 'Db' | 'Eb' | 'Gb' | 'Ab' | 'Bb'

export interface BlackKey {
  readonly sharpName: BlackKeySharpName
  readonly flatName: BlackKeyFlatName
  readonly noteIndex: NoteIndex
  readonly leftWhiteKeyIndex: 0 | 1 | 3 | 4 | 5
}

export const WHITE_KEYS: readonly WhiteKey[] = Object.freeze([
  { name: 'C', noteIndex: 0, slot: 0 },
  { name: 'D', noteIndex: 2, slot: 1 },
  { name: 'E', noteIndex: 4, slot: 2 },
  { name: 'F', noteIndex: 5, slot: 3 },
  { name: 'G', noteIndex: 7, slot: 4 },
  { name: 'A', noteIndex: 9, slot: 5 },
  { name: 'B', noteIndex: 11, slot: 6 },
])

export const BLACK_KEYS: readonly BlackKey[] = Object.freeze([
  { sharpName: 'C#', flatName: 'Db', noteIndex: 1, leftWhiteKeyIndex: 0 },
  { sharpName: 'D#', flatName: 'Eb', noteIndex: 3, leftWhiteKeyIndex: 1 },
  { sharpName: 'F#', flatName: 'Gb', noteIndex: 6, leftWhiteKeyIndex: 3 },
  { sharpName: 'G#', flatName: 'Ab', noteIndex: 8, leftWhiteKeyIndex: 4 },
  { sharpName: 'A#', flatName: 'Bb', noteIndex: 10, leftWhiteKeyIndex: 5 },
])

// Visual / focus order across the whole keyboard: C, C#, D, D#, E, F, F#, G, G#, A, A#, B.
export const PIANO_TAB_ORDER: readonly NoteIndex[] = Object.freeze([
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11,
])
