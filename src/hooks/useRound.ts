import { useReducer, useCallback } from 'react'
import { roundReducer, type RoundState } from '../domain/round'
import type { Note } from '../domain/notes'
import type { FretboardPosition } from '../domain/fretboard'

export interface UseRoundResult {
  readonly round: RoundState | null
  startRound: (note: Note, slot?: number) => void
  tap: (position: FretboardPosition) => void
  resetRound: () => void
}

export function useRound(): UseRoundResult {
  const [round, dispatch] = useReducer(roundReducer, null)

  const startRound = useCallback(
    (note: Note, slot = 0) => dispatch({ type: 'START_ROUND', note, slot }),
    [],
  )
  const tap = useCallback(
    (position: FretboardPosition) => dispatch({ type: 'TAP', position }),
    [],
  )
  const resetRound = useCallback(() => dispatch({ type: 'RESET_ROUND' }), [])

  return { round, startRound, tap, resetRound }
}
