import { describe, it, expect } from 'vitest'
import {
  noteAt,
  OPEN_STRING_NOTE_INDEX,
  REFERENCE_MARKERS,
  MAX_FRET_MOBILE,
  MAX_FRET_DESKTOP,
  STRING_NUMBERS,
  DISPLAY_STRING_ORDER,
  pitchOfPosition,
} from '../../domain/fretboard'

describe('OPEN_STRING_NOTE_INDEX', () => {
  it('uses E A D G B E for strings 6 5 4 3 2 1 (standard tuning)', () => {
    // string 6 (low E) → E = 4
    expect(OPEN_STRING_NOTE_INDEX[6]).toBe(4)
    // string 5 → A = 9
    expect(OPEN_STRING_NOTE_INDEX[5]).toBe(9)
    // string 4 → D = 2
    expect(OPEN_STRING_NOTE_INDEX[4]).toBe(2)
    // string 3 → G = 7
    expect(OPEN_STRING_NOTE_INDEX[3]).toBe(7)
    // string 2 → B = 11
    expect(OPEN_STRING_NOTE_INDEX[2]).toBe(11)
    // string 1 (high E) → E = 4
    expect(OPEN_STRING_NOTE_INDEX[1]).toBe(4)
  })
})

describe('noteAt', () => {
  it('returns the open-string note when fret = 0', () => {
    expect(noteAt({ string: 6, fret: 0 })).toBe(4) // E
    expect(noteAt({ string: 5, fret: 0 })).toBe(9) // A
    expect(noteAt({ string: 4, fret: 0 })).toBe(2) // D
    expect(noteAt({ string: 3, fret: 0 })).toBe(7) // G
    expect(noteAt({ string: 2, fret: 0 })).toBe(11) // B
    expect(noteAt({ string: 1, fret: 0 })).toBe(4) // E
  })

  it('returns the same pitch class one octave higher at the 12th fret', () => {
    for (const s of [1, 2, 3, 4, 5, 6] as const) {
      expect(noteAt({ string: s, fret: 12 })).toBe(OPEN_STRING_NOTE_INDEX[s])
    }
  })

  it('matches the Ted Greene reference anchors', () => {
    // A on 5th fret of 6th string
    expect(noteAt({ string: 6, fret: 5 })).toBe(9)
    // D on 5th fret of 5th string
    expect(noteAt({ string: 5, fret: 5 })).toBe(2)
    // G on 5th fret of 4th string
    expect(noteAt({ string: 4, fret: 5 })).toBe(7)
    // B on 4th fret of 3rd string
    expect(noteAt({ string: 3, fret: 4 })).toBe(11)
    // E on 5th fret of 2nd string
    expect(noteAt({ string: 2, fret: 5 })).toBe(4)
  })

  it('covers all 6 strings × frets 0..12 without throwing', () => {
    for (const s of [1, 2, 3, 4, 5, 6] as const) {
      for (let f = 0; f <= 12; f++) {
        const idx = noteAt({ string: s, fret: f })
        expect(idx).toBeGreaterThanOrEqual(0)
        expect(idx).toBeLessThanOrEqual(11)
      }
    }
  })
})

describe('REFERENCE_MARKERS', () => {
  it('contains the six Ted Greene anchor positions (A-D-G-B-E-A across all six strings, fret 5 except B on fret 4)', () => {
    expect(REFERENCE_MARKERS).toHaveLength(6)
    expect(REFERENCE_MARKERS).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ position: { string: 6, fret: 5 }, label: 'A' }),
        expect.objectContaining({ position: { string: 5, fret: 5 }, label: 'D' }),
        expect.objectContaining({ position: { string: 4, fret: 5 }, label: 'G' }),
        expect.objectContaining({ position: { string: 3, fret: 4 }, label: 'B' }),
        expect.objectContaining({ position: { string: 2, fret: 5 }, label: 'E' }),
        expect.objectContaining({ position: { string: 1, fret: 5 }, label: 'A' }),
      ]),
    )
  })

  it('each marker label matches the note actually at that position', () => {
    const labelToIndex: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }
    for (const m of REFERENCE_MARKERS) {
      expect(noteAt(m.position)).toBe(labelToIndex[m.label])
    }
  })
})

describe('fret-range constants', () => {
  it('mobile shows exactly 12 frets', () => {
    expect(MAX_FRET_MOBILE).toBe(12)
  })

  it('desktop allows up to 24 frets', () => {
    expect(MAX_FRET_DESKTOP).toBe(24)
  })
})

describe('pitchOfPosition (concrete pitch under standard tuning)', () => {
  it('maps every open string to its real-world open pitch', () => {
    expect(pitchOfPosition({ string: 6, fret: 0 })).toEqual({ noteIndex: 4, octave: 2 }) // E2
    expect(pitchOfPosition({ string: 5, fret: 0 })).toEqual({ noteIndex: 9, octave: 2 }) // A2
    expect(pitchOfPosition({ string: 4, fret: 0 })).toEqual({ noteIndex: 2, octave: 3 }) // D3
    expect(pitchOfPosition({ string: 3, fret: 0 })).toEqual({ noteIndex: 7, octave: 3 }) // G3
    expect(pitchOfPosition({ string: 2, fret: 0 })).toEqual({ noteIndex: 11, octave: 3 }) // B3
    expect(pitchOfPosition({ string: 1, fret: 0 })).toEqual({ noteIndex: 4, octave: 4 }) // E4
  })

  it('maps fretted positions to the correct pitch + octave', () => {
    expect(pitchOfPosition({ string: 6, fret: 3 })).toEqual({ noteIndex: 7, octave: 2 }) // G2
    expect(pitchOfPosition({ string: 6, fret: 12 })).toEqual({ noteIndex: 4, octave: 3 }) // E3
    expect(pitchOfPosition({ string: 1, fret: 12 })).toEqual({ noteIndex: 4, octave: 5 }) // E5
    expect(pitchOfPosition({ string: 1, fret: 24 })).toEqual({ noteIndex: 4, octave: 6 }) // E6
    expect(pitchOfPosition({ string: 4, fret: 7 })).toEqual({ noteIndex: 9, octave: 3 }) // A3
  })

  it('is total over every string × fret 0..24 and produces an octave in 2..6', () => {
    for (const s of [1, 2, 3, 4, 5, 6] as const) {
      for (let f = 0; f <= 24; f++) {
        const { noteIndex, octave } = pitchOfPosition({ string: s, fret: f })
        expect(noteIndex).toBeGreaterThanOrEqual(0)
        expect(noteIndex).toBeLessThanOrEqual(11)
        expect(octave).toBeGreaterThanOrEqual(2)
        expect(octave).toBeLessThanOrEqual(6)
      }
    }
  })

  it('octave wraps correctly at the boundary (fret 7 on string 6 is B2, fret 8 is C3)', () => {
    expect(pitchOfPosition({ string: 6, fret: 7 })).toEqual({ noteIndex: 11, octave: 2 }) // B2
    expect(pitchOfPosition({ string: 6, fret: 8 })).toEqual({ noteIndex: 0, octave: 3 }) // C3
  })
})

describe('string-order constants', () => {
  it('DISPLAY_STRING_ORDER walks string 1 (high E) → string 6 (low E)', () => {
    expect(DISPLAY_STRING_ORDER).toEqual([1, 2, 3, 4, 5, 6])
  })

  it('STRING_NUMBERS walks string 6 → string 1 (logical iteration order, unchanged)', () => {
    expect(STRING_NUMBERS).toEqual([6, 5, 4, 3, 2, 1])
  })

  it('DISPLAY_STRING_ORDER is the reverse of STRING_NUMBERS', () => {
    expect(DISPLAY_STRING_ORDER).toEqual([...STRING_NUMBERS].reverse())
  })
})
