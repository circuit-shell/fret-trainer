export type NoteIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11

export type SharpName =
  | 'C'
  | 'C#'
  | 'D'
  | 'D#'
  | 'E'
  | 'F'
  | 'F#'
  | 'G'
  | 'G#'
  | 'A'
  | 'A#'
  | 'B'

export type FlatName =
  | 'C'
  | 'Db'
  | 'D'
  | 'Eb'
  | 'E'
  | 'F'
  | 'Gb'
  | 'G'
  | 'Ab'
  | 'A'
  | 'Bb'
  | 'B'

export interface Note {
  readonly index: NoteIndex
  readonly sharpName: SharpName
  readonly flatName: FlatName
  readonly displayLabel: string
}

const SHARP_NAMES: readonly SharpName[] = [
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

const FLAT_NAMES: readonly FlatName[] = [
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

function makeNote(index: NoteIndex): Note {
  const sharpName = SHARP_NAMES[index]
  const flatName = FLAT_NAMES[index]
  return {
    index,
    sharpName,
    flatName,
    displayLabel: sharpName === flatName ? sharpName : `${sharpName}/${flatName}`,
  }
}

export const NOTES: readonly Note[] = Object.freeze(
  Array.from({ length: 12 }, (_, i) => makeNote(i as NoteIndex)),
)

export function notesEqual(a: Note, b: Note): boolean {
  return a.index === b.index
}

export function noteByIndex(index: NoteIndex): Note {
  return NOTES[index]
}
