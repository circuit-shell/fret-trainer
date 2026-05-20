import { describe, it, expect } from 'vitest'
import { WHITE_KEYS, BLACK_KEYS, PIANO_TAB_ORDER } from '../../domain/piano'

describe('WHITE_KEYS', () => {
  it('contains 7 keys in C-major order: C, D, E, F, G, A, B', () => {
    expect(WHITE_KEYS).toHaveLength(7)
    expect(WHITE_KEYS.map((k) => k.name)).toEqual(['C', 'D', 'E', 'F', 'G', 'A', 'B'])
  })

  it('maps the 7 white keys to note indices [0, 2, 4, 5, 7, 9, 11]', () => {
    expect(WHITE_KEYS.map((k) => k.noteIndex)).toEqual([0, 2, 4, 5, 7, 9, 11])
  })

  it('assigns slot indices 0..6 left-to-right', () => {
    expect(WHITE_KEYS.map((k) => k.slot)).toEqual([0, 1, 2, 3, 4, 5, 6])
  })
})

describe('BLACK_KEYS', () => {
  it('contains 5 keys in pitch order: C#, D#, F#, G#, A#', () => {
    expect(BLACK_KEYS).toHaveLength(5)
    expect(BLACK_KEYS.map((k) => k.sharpName)).toEqual(['C#', 'D#', 'F#', 'G#', 'A#'])
  })

  it('pairs each sharp with its flat equivalent', () => {
    expect(BLACK_KEYS.map((k) => k.flatName)).toEqual(['Db', 'Eb', 'Gb', 'Ab', 'Bb'])
  })

  it('maps the 5 black keys to note indices [1, 3, 6, 8, 10]', () => {
    expect(BLACK_KEYS.map((k) => k.noteIndex)).toEqual([1, 3, 6, 8, 10])
  })

  it('uses leftWhiteKeyIndex values [0, 1, 3, 4, 5] (no black key past E or B)', () => {
    expect(BLACK_KEYS.map((k) => k.leftWhiteKeyIndex)).toEqual([0, 1, 3, 4, 5])
  })
})

describe('every NoteIndex 0..11 appears exactly once', () => {
  it('white + black together cover all 12 chromatic pitch classes uniquely', () => {
    const all = [
      ...WHITE_KEYS.map((k) => k.noteIndex),
      ...BLACK_KEYS.map((k) => k.noteIndex),
    ].sort((a, b) => a - b)
    expect(all).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
  })
})

describe('PIANO_TAB_ORDER', () => {
  it('walks 0..11 in pitch order (left-to-right across the visible keyboard)', () => {
    expect(PIANO_TAB_ORDER).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
  })
})
