export type FretIndicatorBarPosition = 'top' | 'bottom'

export interface FretIndicatorBarProps {
  maxFret: number
  visible: boolean
  // 'top' anchors the numbers near the fretboard at the bottom of the bar.
  // 'bottom' anchors them near the fretboard at the top of the bar. Defaults
  // to 'top' for backward compatibility.
  position?: FretIndicatorBarPosition
}

export function FretIndicatorBar({
  maxFret,
  visible,
  position = 'top',
}: FretIndicatorBarProps) {
  if (!visible) return null

  const fretCount = maxFret + 1
  // Numbers should hug the fretboard regardless of which side the bar sits on.
  const alignmentClass = position === 'top' ? 'items-end pb-1' : 'items-start pt-1'

  return (
    <div
      data-testid="fret-indicator-bar"
      data-position={position}
      role="presentation"
      aria-hidden="true"
      className={`grid select-none ${alignmentClass}`}
      // Leading column mirrors the playing grid's string-number column so fret
      // numbers line up with their cells regardless of the string-numbers
      // toggle. Keep the literal `minmax(2rem, 2.5rem)` in sync with
      // STRING_LABEL_COLUMN in Fretboard.tsx.
      style={{ gridTemplateColumns: `minmax(2rem, 2.5rem) repeat(${fretCount}, minmax(44px, 1fr))` }}
    >
      {/* Leading spacer cell — empty; aligns with the string-number label column. */}
      <div aria-hidden="true" />
      {Array.from({ length: fretCount }, (_, fret) => (
        <div
          key={fret}
          data-fret-number={String(fret)}
          className="text-center font-display text-xs sm:text-sm text-brass-light tabular-nums"
        >
          {/* Skip fret 0 — the open-string column is signaled by the reference
              markers inside the fret-0 cells, not by a numeric label. */}
          {fret === 0 ? '' : <span className="counter-rotate">{fret}</span>}
        </div>
      ))}
    </div>
  )
}
