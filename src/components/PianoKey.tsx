import type { CSSProperties } from 'react'
import type { NoteIndex } from '../domain/notes'

export type PianoKeyVariant = 'white' | 'black'

export interface PianoKeyProps {
  variant: PianoKeyVariant
  noteIndex: NoteIndex
  visibleLabel: string | { sharp: string; flat: string }
  /** Optional secondary label for white keys — the enharmonic alternate
   * (e.g., "B#" on the C key, "E#" on the F key). Rendered smaller and
   * faded beneath the primary label. Ignored on black keys. */
  alternateLabel?: string
  ariaLabel: string
  selected: boolean
  labelsVisible: boolean
  onSelect: (noteIndex: NoteIndex) => void
  style?: CSSProperties
}

export function PianoKey({
  variant,
  noteIndex,
  visibleLabel,
  alternateLabel,
  ariaLabel,
  selected,
  labelsVisible,
  onSelect,
  style,
}: PianoKeyProps) {
  const isBlack = variant === 'black'

  // White keys honor the 44×44 minimum tap target; black keys cannot be 44 px
  // wide on small mobile without overlapping the centers of adjacent white keys,
  // so they size only from the layout math and remain narrower-but-tall.
  const baseClasses = [
    'flex flex-col items-center justify-end',
    'transition-colors duration-100',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-brass focus-visible:z-30',
    isBlack ? '' : 'min-h-tap min-w-tap',
  ].join(' ')

  if (isBlack) {
    return (
      <button
        type="button"
        aria-label={ariaLabel}
        aria-pressed={selected}
        data-note-index={noteIndex}
        data-variant="black"
        onClick={() => onSelect(noteIndex)}
        style={style}
        className={[
          baseClasses,
          'rounded-b-md border border-walnut-dark',
          'shadow-[0_3px_6px_rgba(0,0,0,0.45)]',
          'pb-1.5 px-0.5 z-20',
          selected
            ? 'bg-walnut-dark text-brass-light border-b-4 border-b-brass'
            : 'bg-walnut-dark text-cream/80 hover:bg-walnut',
        ].join(' ')}
      >
        {labelsVisible && typeof visibleLabel === 'object' && (
          <span className="flex flex-col items-center leading-tight text-[10px] sm:text-xs font-display tabular-nums">
            <span>{visibleLabel.sharp}</span>
            <span className="opacity-70">{visibleLabel.flat}</span>
          </span>
        )}
      </button>
    )
  }

  // White key
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      aria-pressed={selected}
      data-note-index={noteIndex}
      data-variant="white"
      onClick={() => onSelect(noteIndex)}
      style={style}
      className={[
        baseClasses,
        'rounded-b-md border border-walnut text-walnut-dark',
        'pb-2',
        'z-10',
        selected
          ? 'bg-brass-light shadow-inner'
          : 'bg-ivory hover:bg-cream',
      ].join(' ')}
    >
      {labelsVisible && typeof visibleLabel === 'string' && (
        <span className="flex flex-col items-center leading-tight font-display tracking-wide">
          {alternateLabel && (
            <span className="text-[10px] sm:text-xs opacity-60 tabular-nums">
              {alternateLabel}
            </span>
          )}
          <span className="text-sm">{visibleLabel}</span>
        </span>
      )}
    </button>
  )
}
