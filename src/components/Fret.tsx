import { noteAt, type FretboardPosition, type StringNumber } from '../domain/fretboard'
import { NOTES } from '../domain/notes'
import {
  type NotationSystem,
  DEFAULT_NOTATION,
  sharpNameIn,
} from '../domain/notation'
import type { AttemptOutcome } from '../domain/round'

const OPEN_NAME: Record<StringNumber, string> = {
  1: 'high E',
  2: 'B',
  3: 'G',
  4: 'D',
  5: 'A',
  6: 'low E',
}

export interface FretProps {
  position: FretboardPosition
  attempt: AttemptOutcome | null
  showReferenceMarker: boolean
  showReferenceName?: boolean
  notation?: NotationSystem
  /** When true, this cell is the rightmost fret on its string — render a
   * brass end-cap on the right edge that mirrors the nut divider. */
  isLastFret?: boolean
  onTap: (pos: FretboardPosition) => void
  onAudio?: (pos: FretboardPosition) => void
}

export function Fret({
  position,
  attempt,
  showReferenceMarker,
  showReferenceName = true,
  notation = DEFAULT_NOTATION,
  isLastFret = false,
  onTap,
  onAudio,
}: FretProps) {
  const noteIndex = noteAt(position)
  // aria-label stays in letter notation for screen-reader consistency across
  // notation toggles. Visible reference-marker label uses the chosen notation.
  const ariaNoteName = NOTES[noteIndex].sharpName
  const visibleNoteName = sharpNameIn(notation, noteIndex)
  const label = `String ${position.string} (${OPEN_NAME[position.string]}), fret ${position.fret} — ${ariaNoteName}`
  const isOpen = position.fret === 0
  const isNut = position.fret === 1

  const dividerKind: 'none' | 'nut' | 'wire' = isOpen ? 'none' : isNut ? 'nut' : 'wire'

  const dividerClass =
    dividerKind === 'nut'
      ? 'border-l-[3px] border-brass'
      : dividerKind === 'wire'
        ? 'border-l border-brass-light/60'
        : ''

  // End-cap: the right edge of the last fret on each string gets the same
  // brass treatment as the nut on the left, framing the rendered range.
  const endCapClass = isLastFret ? 'border-r-[3px] border-brass' : ''

  return (
    <button
      type="button"
      role="button"
      aria-label={label}
      data-attempt={attempt ?? undefined}
      data-string={position.string}
      data-fret={position.fret}
      data-divider={dividerKind}
      onClick={() => {
        onAudio?.(position)
        onTap(position)
      }}
      className={[
        'relative w-full h-full min-h-tap min-w-tap flex items-center justify-center',
        dividerClass,
        endCapClass,
        isOpen ? 'bg-walnut-dark/40' : 'bg-walnut/30 hover:bg-walnut-light/30',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-brass focus-visible:z-10',
        'transition-colors',
      ].join(' ')}
    >
      {showReferenceMarker && (
        <span
          data-testid={`reference-marker-${position.string}-${position.fret}`}
          aria-hidden="true"
          className="pointer-events-none absolute inset-2 rounded-full bg-ivory/15 ring-1 ring-ivory/20 flex items-center justify-center"
        >
          {showReferenceName && (
            <span
              data-testid={`reference-marker-${position.string}-${position.fret}-label`}
              className="counter-rotate font-display text-[10px] sm:text-xs text-ivory/60 leading-none text-center"
            >
              {visibleNoteName}
            </span>
          )}
        </span>
      )}
      {attempt && (
        <span
          aria-hidden="true"
          className={[
            'absolute inset-1.5 rounded-full flex items-center justify-center font-bold',
            attempt === 'correct'
              ? 'bg-jazz-green text-ivory shadow-md'
              : 'bg-jazz-red text-ivory shadow-md',
          ].join(' ')}
        >
          <span className="counter-rotate">
            {attempt === 'correct' ? '✓' : '✗'}
          </span>
        </span>
      )}
    </button>
  )
}
