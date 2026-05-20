import type { Note } from './notes'
import { noteAt, positionsEqual, type FretboardPosition, type StringNumber } from './fretboard'

export type AttemptOutcome = 'correct' | 'incorrect'

export interface Attempt {
  readonly position: FretboardPosition
  readonly outcome: AttemptOutcome
}

export interface RoundState {
  readonly targetNote: Note
  /** Which of the target pitch's valid names is currently displayed. 0 is the
   * primary name (natural / sharp), 1 is the enharmonic alternate (or flat
   * for accidentals). Used by TargetNoteDisplay; round logic is indifferent
   * to it. */
  readonly targetSlot: number
  readonly attempts: readonly Attempt[]
  readonly foundOnStrings: ReadonlySet<StringNumber>
  readonly isComplete: boolean
}

export type RoundAction =
  | { type: 'START_ROUND'; note: Note; slot?: number }
  | { type: 'TAP'; position: FretboardPosition }
  | { type: 'RESET_ROUND' }

export function roundReducer(state: RoundState | null, action: RoundAction): RoundState | null {
  switch (action.type) {
    case 'START_ROUND':
      return {
        targetNote: action.note,
        targetSlot: action.slot ?? 0,
        attempts: [],
        foundOnStrings: new Set(),
        isComplete: false,
      }

    case 'RESET_ROUND':
      return null

    case 'TAP': {
      if (state === null) return null

      const alreadyAttempted = state.attempts.some((a) => positionsEqual(a.position, action.position))
      if (alreadyAttempted) return state

      const correct = noteAt(action.position) === state.targetNote.index
      const attempt: Attempt = {
        position: action.position,
        outcome: correct ? 'correct' : 'incorrect',
      }
      const attempts = [...state.attempts, attempt]
      const foundOnStrings = new Set(state.foundOnStrings)
      if (correct) foundOnStrings.add(action.position.string)
      return {
        ...state,
        attempts,
        foundOnStrings,
        isComplete: foundOnStrings.size === 6,
      }
    }
  }
}
