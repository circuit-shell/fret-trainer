import { describe, it, expect } from 'vitest'
import { NOTES } from '../../domain/notes'
import { roundReducer, type RoundState, type RoundAction } from '../../domain/round'

const C = NOTES[0]
const D = NOTES[2]

function start(note = C): RoundState {
  const s = roundReducer(null, { type: 'START_ROUND', note })
  if (s === null) throw new Error('START_ROUND should never return null')
  return s
}

describe('roundReducer — START_ROUND', () => {
  it('creates a fresh round from null', () => {
    const state = start(C)
    expect(state).not.toBeNull()
    expect(state!.targetNote.index).toBe(0)
    expect(state!.attempts).toEqual([])
    expect(state!.foundOnStrings.size).toBe(0)
    expect(state!.isComplete).toBe(false)
  })

  it('replaces an existing round with attempts cleared', () => {
    let state: RoundState | null = start(C)
    state = roundReducer(state, { type: 'TAP', position: { string: 6, fret: 8 } })
    expect(state!.attempts).toHaveLength(1)
    state = roundReducer(state, { type: 'START_ROUND', note: D })
    expect(state!.targetNote.index).toBe(2)
    expect(state!.attempts).toEqual([])
    expect(state!.foundOnStrings.size).toBe(0)
  })
})

describe('roundReducer — TAP (correct)', () => {
  it('records a correct attempt on each string and adds to foundOnStrings', () => {
    let state: RoundState | null = start(C)
    // C is at fret 8 on string 6 (low E) — E(4) + 8 = 12 mod 12 = 0
    state = roundReducer(state, { type: 'TAP', position: { string: 6, fret: 8 } })
    expect(state!.attempts).toHaveLength(1)
    expect(state!.attempts[0].outcome).toBe('correct')
    expect(state!.foundOnStrings.has(6)).toBe(true)
    expect(state!.isComplete).toBe(false)
  })

  it('marks isComplete=true after one correct attempt on each of the six strings', () => {
    let state: RoundState | null = start(C)
    // C positions on each string (any one valid octave per string):
    // string 6 (E): fret 8 → C
    // string 5 (A): fret 3 → C
    // string 4 (D): fret 10 → C
    // string 3 (G): fret 5 → C
    // string 2 (B): fret 1 → C
    // string 1 (E): fret 8 → C
    const cellsForC = [
      { string: 6 as const, fret: 8 },
      { string: 5 as const, fret: 3 },
      { string: 4 as const, fret: 10 },
      { string: 3 as const, fret: 5 },
      { string: 2 as const, fret: 1 },
      { string: 1 as const, fret: 8 },
    ]
    for (const pos of cellsForC) {
      state = roundReducer(state, { type: 'TAP', position: pos })
    }
    expect(state!.foundOnStrings.size).toBe(6)
    expect(state!.isComplete).toBe(true)
  })
})

describe('roundReducer — TAP (incorrect)', () => {
  it('records an incorrect attempt without adding to foundOnStrings', () => {
    let state: RoundState | null = start(C)
    state = roundReducer(state, { type: 'TAP', position: { string: 6, fret: 1 } })
    expect(state!.attempts).toHaveLength(1)
    expect(state!.attempts[0].outcome).toBe('incorrect')
    expect(state!.foundOnStrings.has(6)).toBe(false)
  })
})

describe('roundReducer — TAP (idempotent re-tap)', () => {
  it('is a no-op when re-tapping a position already in attempts', () => {
    let state: RoundState | null = start(C)
    state = roundReducer(state, { type: 'TAP', position: { string: 6, fret: 8 } })
    const after = roundReducer(state, { type: 'TAP', position: { string: 6, fret: 8 } })
    expect(after!.attempts).toHaveLength(1)
    expect(after).toBe(state) // same reference — true no-op
  })

  it('is also a no-op for re-tapping an incorrect position', () => {
    let state: RoundState | null = start(C)
    state = roundReducer(state, { type: 'TAP', position: { string: 6, fret: 1 } })
    const after = roundReducer(state, { type: 'TAP', position: { string: 6, fret: 1 } })
    expect(after!.attempts).toHaveLength(1)
    expect(after).toBe(state)
  })
})

describe('roundReducer — RESET_ROUND', () => {
  it('returns null', () => {
    let state: RoundState | null = start(C)
    state = roundReducer(state, { type: 'TAP', position: { string: 6, fret: 8 } })
    const after = roundReducer(state, { type: 'RESET_ROUND' } satisfies RoundAction)
    expect(after).toBeNull()
  })
})

describe('roundReducer — TAP without active round', () => {
  it('is a no-op when state is null', () => {
    const after = roundReducer(null, { type: 'TAP', position: { string: 6, fret: 5 } })
    expect(after).toBeNull()
  })
})
