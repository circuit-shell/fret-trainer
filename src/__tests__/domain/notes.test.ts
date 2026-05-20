import { describe, it, expect } from 'vitest'
import { NOTES, notesEqual, type Note } from '../../domain/notes'

describe('NOTES constant', () => {
  it('contains exactly 12 chromatic pitch classes', () => {
    expect(NOTES).toHaveLength(12)
  })

  it('indexes the 12 pitch classes 0..11 in order C, C#, D, ..., B', () => {
    const expectedSharps = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
    expectedSharps.forEach((sharp, i) => {
      expect(NOTES[i].index).toBe(i)
      expect(NOTES[i].sharpName).toBe(sharp)
    })
  })

  it('uses the expected flat names', () => {
    const expectedFlats = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']
    expectedFlats.forEach((flat, i) => {
      expect(NOTES[i].flatName).toBe(flat)
    })
  })

  it('shows enharmonic spellings in displayLabel for the five black keys', () => {
    expect(NOTES[1].displayLabel).toBe('C#/Db')
    expect(NOTES[3].displayLabel).toBe('D#/Eb')
    expect(NOTES[6].displayLabel).toBe('F#/Gb')
    expect(NOTES[8].displayLabel).toBe('G#/Ab')
    expect(NOTES[10].displayLabel).toBe('A#/Bb')
  })

  it('shows only one name in displayLabel for the white keys', () => {
    expect(NOTES[0].displayLabel).toBe('C')
    expect(NOTES[2].displayLabel).toBe('D')
    expect(NOTES[4].displayLabel).toBe('E')
    expect(NOTES[5].displayLabel).toBe('F')
    expect(NOTES[7].displayLabel).toBe('G')
    expect(NOTES[9].displayLabel).toBe('A')
    expect(NOTES[11].displayLabel).toBe('B')
  })
})

describe('notesEqual', () => {
  it('returns true for the same Note reference', () => {
    expect(notesEqual(NOTES[0], NOTES[0])).toBe(true)
  })

  it('returns true when indexes match (e.g., both A)', () => {
    const a1: Note = NOTES[9]
    const a2: Note = { ...NOTES[9] }
    expect(notesEqual(a1, a2)).toBe(true)
  })

  it('returns false for different indexes', () => {
    expect(notesEqual(NOTES[0], NOTES[1])).toBe(false)
    expect(notesEqual(NOTES[4], NOTES[11])).toBe(false)
  })
})
