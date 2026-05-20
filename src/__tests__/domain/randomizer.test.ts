import { describe, it, expect } from 'vitest'
import { NOTES } from '../../domain/notes'
import { nextRandomTarget } from '../../domain/randomizer'
import { slotCount } from '../../domain/notation'

describe('nextRandomTarget', () => {
  it('returns a (note, slot) pair from the full 21-name pool when previous is null', () => {
    const target = nextRandomTarget(null)
    expect(NOTES).toContainEqual(target.note)
    expect(target.slot).toBeGreaterThanOrEqual(0)
    expect(target.slot).toBeLessThan(slotCount(target.note.index))
  })

  it('never returns the exact same (note, slot) pair as previous', () => {
    for (let i = 0; i < 200; i++) {
      const prev = { note: NOTES[i % 12], slot: 0 }
      const next = nextRandomTarget(prev)
      expect(next.note.index === prev.note.index && next.slot === prev.slot).toBe(false)
    }
  })

  it('CAN return the same pitch with a different slot (rolling C → B# is allowed)', () => {
    // The user explicitly wants enharmonic alternates in the random pool —
    // rolling C (index 0, slot 0) followed by B# (index 0, slot 1) is fair.
    const prev = { note: NOTES[0], slot: 0 } // C
    let sawSameIndexDifferentSlot = false
    for (let i = 0; i < 500; i++) {
      const next = nextRandomTarget(prev)
      if (next.note.index === 0 && next.slot === 1) {
        sawSameIndexDifferentSlot = true
        break
      }
    }
    expect(sawSameIndexDifferentSlot).toBe(true)
  })

  it('over many trials, eventually returns every non-previous name in the 21-name pool', () => {
    const prev = { note: NOTES[0], slot: 0 } // C
    const seen = new Set<string>()
    for (let i = 0; i < 5000; i++) {
      const t = nextRandomTarget(prev)
      seen.add(`${t.note.index}-${t.slot}`)
      // Pool size 21 minus the one excluded (C/slot 0) = 20 unique entries.
      if (seen.size === 20) break
    }
    expect(seen.size).toBe(20)
    expect(seen.has('0-0')).toBe(false) // never C/slot 0 again
  })

  it('slots returned are always valid for the chosen pitch (slot < slotCount)', () => {
    for (let i = 0; i < 200; i++) {
      const t = nextRandomTarget(null)
      expect(t.slot).toBeLessThan(slotCount(t.note.index))
    }
  })
})
