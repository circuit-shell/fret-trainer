import {
  DISPLAY_STRING_ORDER,
  REFERENCE_MARKERS,
  type FretboardPosition,
  type StringNumber,
} from '../domain/fretboard'
import type { Attempt } from '../domain/round'
import { inlaysInRange, type InlayMarker } from '../domain/inlays'
import { type NotationSystem, DEFAULT_NOTATION } from '../domain/notation'
import { Fret } from './Fret'
import { FretIndicatorBar } from './FretIndicatorBar'

export interface FretboardProps {
  maxFret: number
  attempts: readonly Attempt[]
  referenceMarkersVisible: boolean
  referenceNamesVisible?: boolean
  fretNumbersTopVisible?: boolean
  fretNumbersBottomVisible?: boolean
  inlayDotsVisible?: boolean
  stringNumbersVisible?: boolean
  stringLinesVisible?: boolean
  notation?: NotationSystem
  onTap: (pos: FretboardPosition) => void
  onAudio?: (pos: FretboardPosition) => void
}

function attemptOnCell(
  attempts: readonly Attempt[],
  string: StringNumber,
  fret: number,
): Attempt['outcome'] | null {
  const a = attempts.find((x) => x.position.string === string && x.position.fret === fret)
  return a?.outcome ?? null
}

// A cell shows a reference marker when it is one of the Ted Greene anchors
// (A/D/G on the 5th fret of strings 6/5/4, B on the 4th fret of string 3,
// E on the 5th fret of string 2, A on the 5th fret of string 1) OR when it is
// the open-string cell of any string (fret 0).
function isReferenceCell(string: StringNumber, fret: number): boolean {
  if (fret === 0) return true
  return REFERENCE_MARKERS.some(
    (m) => m.position.string === string && m.position.fret === fret,
  )
}

// String-line overlay: draws 6 thin horizontal lines (one per string) across
// the playing grid, mimicking the strings on a real guitar. Sits behind the
// fret cells (the cells' translucent walnut backgrounds let the lines show
// through). After CSS rotation in vertical mobile mode, these horizontals
// become verticals, matching how strings appear on a guitar held nut-up.
//
// Bass strings (lower string numbers in terms of pitch) are drawn slightly
// thicker than treble strings, so string 6 (low E) is the boldest and
// string 1 (high E) is the finest — a touch of physical realism that also
// helps the player identify the bass side at a glance.
const STRING_LINE_THICKNESS_PX: ReadonlyArray<number> = [1, 1, 1.5, 1.5, 2, 2.5]

function StringLinesOverlay({ fretCount }: { fretCount: number }) {
  return (
    <div
      data-testid="string-lines-overlay"
      aria-hidden="true"
      className="absolute inset-0 grid pointer-events-none"
      style={{
        gridTemplateColumns: `${STRING_LABEL_COLUMN} repeat(${fretCount}, minmax(44px, 1fr))`,
        gridTemplateRows: 'repeat(6, 1fr)',
      }}
    >
      {DISPLAY_STRING_ORDER.map((stringNumber, rowIndex) => {
        // DISPLAY_STRING_ORDER is [1, 2, 3, 4, 5, 6] top-to-bottom. The
        // thickness array is indexed by visual row (0 = string 1 / high E,
        // 5 = string 6 / low E), so the rowIndex maps directly.
        const thicknessPx = STRING_LINE_THICKNESS_PX[rowIndex]
        return (
          <div
            key={stringNumber}
            data-string={stringNumber}
            // Lines start at fret 1 — the OPEN-STRING column (fret 0) sits
            // *behind* the nut and shouldn't have a string drawn through it.
            // Column 1 is the string-number label, column 2 is fret 0, so
            // fret 1 lives at column 3.
            style={{
              gridColumn: `3 / ${fretCount + 2}`,
              gridRow: `${rowIndex + 1} / ${rowIndex + 2}`,
            }}
            className="flex items-center"
          >
            <div
              style={{ height: `${thicknessPx}px` }}
              className="w-full bg-gradient-to-b from-cream/50 via-cream/70 to-cream/40 shadow-[0_0_2px_rgba(0,0,0,0.4)]"
            />
          </div>
        )
      })}
    </div>
  )
}

// Inlay-dot overlay: renders a real-guitar-style inlay at each inlay fret.
// The grid mirrors the playing grid (leading string-number column + N+1
// fret columns × 6 rows). On mobile the entire fretboard is rotated as a
// unit via CSS transform on the wrapper; this overlay rotates with it and
// stays aligned with the cells.
function InlayOverlay({
  inlays,
  fretCount,
}: {
  inlays: readonly InlayMarker[]
  fretCount: number
}) {
  return (
    <div
      data-testid="inlay-overlay"
      aria-hidden="true"
      className="absolute inset-0 grid pointer-events-none"
      style={{
        gridTemplateColumns: `${STRING_LABEL_COLUMN} repeat(${fretCount}, minmax(44px, 1fr))`,
        gridTemplateRows: 'repeat(6, 1fr)',
      }}
    >
      {inlays.map((inlay) => {
        // Column 1 is reserved for the string-number label; fret 0 lives in
        // column 2; fret N lives in column N + 2.
        const col = inlay.fret + 2
        if (inlay.kind === 'single') {
          return (
            <div
              key={inlay.fret}
              data-testid={`inlay-dot-${inlay.fret}`}
              data-kind="single"
              style={{ gridColumn: `${col} / ${col + 1}`, gridRow: '3 / 5' }}
              className="flex items-center justify-center"
            >
              <span className="block w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-ivory/80 ring-1 ring-ivory/40 shadow" />
            </div>
          )
        }
        return (
          <div
            key={inlay.fret}
            data-testid={`inlay-dot-${inlay.fret}`}
            data-kind="double"
            style={{ gridColumn: `${col} / ${col + 1}`, gridRow: '2 / 6' }}
            className="flex flex-col items-center justify-around"
          >
            <span className="block w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-ivory/80 ring-1 ring-ivory/40 shadow" />
            <span className="block w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-ivory/80 ring-1 ring-ivory/40 shadow" />
          </div>
        )
      })}
    </div>
  )
}

// Ordinal label for a string number ("1st", "2nd", "3rd", "4th", ...). Used by
// the leading column/row of the fretboard grid when stringNumbersVisible is on.
function stringOrdinal(n: StringNumber): string {
  if (n === 1) return '1st'
  if (n === 2) return '2nd'
  if (n === 3) return '3rd'
  return `${n}th`
}

// String-number label cell. Always rendered to reserve space (so flipping the
// toggle never causes layout shift); the text fades in/out based on `visible`.
// Sticky-positioned along the leading edge so it remains visible during
// horizontal scroll on narrow viewports.
function StringNumberLabel({
  stringNumber,
  visible,
}: {
  stringNumber: StringNumber
  visible: boolean
}) {
  return (
    <div
      data-testid={`string-number-label-${stringNumber}`}
      data-string={stringNumber}
      aria-hidden={!visible}
      className={[
        'sticky left-0 z-20',
        'flex items-center justify-center',
        'bg-walnut/95 backdrop-blur-sm',
        'pr-1 sm:pr-1.5',
        'font-display text-[10px] sm:text-xs tabular-nums',
        'select-none',
        visible ? 'text-cream/85' : 'text-transparent',
        'transition-colors',
      ].join(' ')}
    >
      <span className="counter-rotate">{stringOrdinal(stringNumber)}</span>
    </div>
  )
}

// Reserved width (horizontal) / height (vertical) for the string-number
// leading column. Always reserved so toggling never causes layout shift.
// 32px on mobile, 40px from sm: up. Kept in sync with FretIndicatorBar.tsx.
export const STRING_LABEL_COLUMN = 'minmax(2rem, 2.5rem)'

// Reserved height for the top and bottom fret-number slots in horizontal mode.
// h-6 = 24px (mobile); sm:h-7 = 28px (≥ 640px).
const FRET_NUMBER_SLOT_CLASS = 'h-6 sm:h-7'

export function Fretboard({
  maxFret,
  attempts,
  referenceMarkersVisible,
  referenceNamesVisible = true,
  fretNumbersTopVisible = false,
  fretNumbersBottomVisible = false,
  inlayDotsVisible = false,
  stringNumbersVisible = false,
  stringLinesVisible = true,
  notation = DEFAULT_NOTATION,
  onTap,
  onAudio,
}: FretboardProps) {
  const fretCount = maxFret + 1
  const inlays = inlayDotsVisible ? inlaysInRange(maxFret) : []

  return (
    <div
      className="relative overflow-x-auto rounded-md ring-1 ring-walnut-light/60 bg-walnut/40 p-2 sm:p-3 shadow-xl"
      data-testid="fretboard-container"
    >
      {/* Top fret-number slot — reserves fixed height even when hidden so
          the playing grid never moves vertically when toggles flip. */}
      <div className={FRET_NUMBER_SLOT_CLASS} data-testid="fret-numbers-top-slot">
        <FretIndicatorBar maxFret={maxFret} visible={fretNumbersTopVisible} position="top" />
      </div>

      <div className="relative">
        {/* Inlay dots paint BEHIND the playing grid — they sit in the wood-toned
            background like real guitar inlays. The cells' translucent walnut
            backgrounds let the dots show through subtly. */}
        {inlayDotsVisible && <InlayOverlay inlays={inlays} fretCount={fretCount} />}
        {/* String lines paint over the inlays but still behind the playing
            grid, so the cells' tap targets aren't blocked and the lines look
            like strings stretched across the wood. */}
        {stringLinesVisible && <StringLinesOverlay fretCount={fretCount} />}
        <div
          role="grid"
          aria-label="Fretboard"
          style={{
            gridTemplateColumns: `${STRING_LABEL_COLUMN} repeat(${fretCount}, minmax(44px, 1fr))`,
          }}
          className="relative grid min-w-0"
        >
          {DISPLAY_STRING_ORDER.flatMap((s) => [
            <StringNumberLabel
              key={`s-${s}-label`}
              stringNumber={s}
              visible={stringNumbersVisible}
            />,
            ...Array.from({ length: fretCount }, (_, fret) => (
              <Fret
                key={`${s}-${fret}`}
                position={{ string: s, fret }}
                attempt={attemptOnCell(attempts, s, fret)}
                showReferenceMarker={referenceMarkersVisible && isReferenceCell(s, fret)}
                showReferenceName={referenceNamesVisible}
                notation={notation}
                isLastFret={fret === maxFret}
                onTap={onTap}
                onAudio={onAudio}
              />
            )),
          ])}
        </div>
      </div>

      {/* Bottom fret-number slot — same height-reservation contract as the top. */}
      <div className={FRET_NUMBER_SLOT_CLASS} data-testid="fret-numbers-bottom-slot">
        <FretIndicatorBar maxFret={maxFret} visible={fretNumbersBottomVisible} position="bottom" />
      </div>
    </div>
  )
}
