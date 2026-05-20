import type { Note } from '../domain/notes'
import {
  type NotationSystem,
  DEFAULT_NOTATION,
  nameAt,
  sharpNameIn,
} from '../domain/notation'
import { TrebleClef } from './TrebleClef'
import { useTranslation } from '../hooks/useTranslation'

export interface TargetNoteDisplayProps {
  note: Note | null
  /** Which of the target pitch's valid names to display (0 = primary,
   * 1 = enharmonic alternate). Defaults to 0 for callers that haven't
   * upgraded; new callers should pass it explicitly from the round state. */
  slot?: number
  notation?: NotationSystem
  onRandom: () => void
}

export function TargetNoteDisplay({
  note,
  slot = 0,
  notation = DEFAULT_NOTATION,
  onRandom,
}: TargetNoteDisplayProps) {
  const t = useTranslation()
  const displayedLabel = note === null ? '' : nameAt(notation, note.index, slot)
  // For the aria-label, use the canonical letter sharp so screen-reader
  // output stays stable regardless of notation toggle.
  const ariaCurrent = note === null ? null : sharpNameIn('letter', note.index)
  const ariaLabel =
    note === null
      ? t('target.aria.pickRandom')
      : `${t('target.aria.reroll')} (${ariaCurrent})`

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onRandom}
      className={[
        'group inline-flex flex-col items-center justify-center gap-1 px-6 py-3 rounded-lg',
        // Matched to SessionTimer so both boxes have identical hover area
        // regardless of content. The min-w sits just above the inner value
        // stage's 9rem / 11rem so the box is no wider than necessary; the
        // min-h covers both the note-display's content and the timer's
        // taller stack (title + digits + reset button).
        'min-w-[12rem] sm:min-w-[14rem] min-h-[13rem] sm:min-h-[14.5rem]',
        'border border-walnut-light/40',
        'bg-transparent hover:bg-walnut/30 active:bg-walnut/40',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-brass',
        'transition-colors',
      ].join(' ')}
    >
      {/* Two explicit rows so the label width is bounded and no layout shift
          happens when the language changes (Spanish row 2 is the longest of
          the four: 20 chars). `whitespace-nowrap` keeps each row on one line
          regardless of the box's width; `text-[10px] sm:text-xs` is sized to
          fit even the longest row at the smallest viewport. */}
      <span className="flex flex-col items-center leading-tight text-cream/60 text-[10px] sm:text-xs tracking-widest uppercase text-center">
        <span className="whitespace-nowrap">{t('target.label.row1')}</span>
        <span className="whitespace-nowrap">{t('target.label.row2')}</span>
      </span>

      {/* Fixed-size stage so the page does not shift when the user switches
          between states. Single-name labels only now — the dual "X/Y" form
          is gone, so the display can use a consistent large font size. */}
      <span
        className={[
          'flex items-center justify-center h-24 sm:h-28 min-w-[9rem] sm:min-w-[11rem]',
          'drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)] group-hover:scale-[1.03]',
          'transition-[color,transform]',
          // Once a note is set (by random roll or piano tap), the label
          // glows brass-light — same yellow the timer uses while counting
          // and the selected piano key is tinted with. The treble-clef
          // placeholder keeps the neutral ivory.
          note === null ? 'text-ivory' : 'text-brass-light',
        ].join(' ')}
        aria-live="polite"
      >
        {note === null ? (
          <TrebleClef className="h-full w-auto" />
        ) : (
          <span className="font-display leading-none text-6xl sm:text-7xl">
            {displayedLabel}
          </span>
        )}
      </span>
    </button>
  )
}
