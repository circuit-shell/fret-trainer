import { describe, it, expect } from 'vitest'
import {
  sharpNameIn,
  flatNameIn,
  displayLabelIn,
  DEFAULT_NOTATION,
} from '../../domain/notation'
import type { NoteIndex } from '../../domain/notes'

describe('notation helpers', () => {
  it('default notation is letter', () => {
    expect(DEFAULT_NOTATION).toBe('letter')
  })

  it('letter notation: sharp names span C..B', () => {
    const sharps = Array.from({ length: 12 }, (_, i) => sharpNameIn('letter', i as NoteIndex))
    expect(sharps).toEqual(['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'])
  })

  it('letter notation: flat names use the standard "b" form for black keys', () => {
    expect(flatNameIn('letter', 1)).toBe('Db')
    expect(flatNameIn('letter', 6)).toBe('Gb')
    expect(flatNameIn('letter', 10)).toBe('Bb')
    // Natural notes are identical sharp/flat.
    expect(flatNameIn('letter', 0)).toBe('C')
    expect(flatNameIn('letter', 4)).toBe('E')
  })

  it('solfege notation: sharp names span Do..Si', () => {
    const sharps = Array.from({ length: 12 }, (_, i) => sharpNameIn('solfege', i as NoteIndex))
    expect(sharps).toEqual([
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
    ])
  })

  it('solfege notation: flat names use the "b" form on black keys', () => {
    expect(flatNameIn('solfege', 1)).toBe('Reb')
    expect(flatNameIn('solfege', 3)).toBe('Mib')
    expect(flatNameIn('solfege', 6)).toBe('Solb')
    expect(flatNameIn('solfege', 8)).toBe('Lab')
    expect(flatNameIn('solfege', 10)).toBe('Sib')
  })

  it('displayLabel returns the single name for white keys', () => {
    expect(displayLabelIn('letter', 0)).toBe('C')
    expect(displayLabelIn('solfege', 0)).toBe('Do')
    expect(displayLabelIn('solfege', 9)).toBe('La')
  })

  it('displayLabel returns sharp/flat stacked for black keys', () => {
    expect(displayLabelIn('letter', 1)).toBe('C#/Db')
    expect(displayLabelIn('letter', 6)).toBe('F#/Gb')
    expect(displayLabelIn('solfege', 1)).toBe('Do#/Reb')
    expect(displayLabelIn('solfege', 6)).toBe('Fa#/Solb')
    expect(displayLabelIn('solfege', 10)).toBe('La#/Sib')
  })
})
