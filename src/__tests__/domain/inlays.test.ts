import { describe, it, expect } from 'vitest'
import { INLAY_FRETS, inlaysInRange } from '../../domain/inlays'

describe('INLAY_FRETS', () => {
  it('contains exactly the ten US/Fender-style inlay positions', () => {
    expect(INLAY_FRETS.map((i) => i.fret)).toEqual([3, 5, 7, 9, 12, 15, 17, 19, 21, 24])
  })

  it('marks frets 12 and 24 as double inlays and the rest as single', () => {
    for (const i of INLAY_FRETS) {
      if (i.fret === 12 || i.fret === 24) {
        expect(i.kind).toBe('double')
      } else {
        expect(i.kind).toBe('single')
      }
    }
  })
})

describe('inlaysInRange', () => {
  it('returns the five entries at or below the 12-fret mobile range', () => {
    const got = inlaysInRange(12)
    expect(got.map((i) => i.fret)).toEqual([3, 5, 7, 9, 12])
  })

  it('returns all ten entries at the full 24-fret desktop range', () => {
    const got = inlaysInRange(24)
    expect(got.map((i) => i.fret)).toEqual([3, 5, 7, 9, 12, 15, 17, 19, 21, 24])
  })

  it('returns the four single-dot entries when the range stops at 11', () => {
    const got = inlaysInRange(11)
    expect(got.map((i) => i.fret)).toEqual([3, 5, 7, 9])
  })

  it('returns nothing when the range is below the first inlay (< 3)', () => {
    expect(inlaysInRange(2)).toEqual([])
    expect(inlaysInRange(0)).toEqual([])
  })
})
