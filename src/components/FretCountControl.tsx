import { FRET_COUNT_MAX, FRET_COUNT_MIN, clampFretCount } from '../domain/settings'

export interface FretCountControlProps {
  value: number
  onChange: (next: number) => void
}

export function FretCountControl({ value, onChange }: FretCountControlProps) {
  const clamped = clampFretCount(value)
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label
          htmlFor="fret-count-range"
          className="text-sm text-cream/90"
        >
          Frets shown
        </label>
        <output
          htmlFor="fret-count-range"
          aria-live="polite"
          className="font-display text-brass-light tabular-nums min-w-[2ch] text-right"
        >
          {clamped}
        </output>
      </div>
      <input
        id="fret-count-range"
        type="range"
        min={FRET_COUNT_MIN}
        max={FRET_COUNT_MAX}
        step={1}
        value={clamped}
        aria-label="Number of frets shown"
        aria-valuemin={FRET_COUNT_MIN}
        aria-valuemax={FRET_COUNT_MAX}
        aria-valuenow={clamped}
        onChange={(e) => onChange(clampFretCount(Number(e.target.value)))}
        className="w-full accent-brass focus:outline-none focus-visible:ring-2 focus-visible:ring-brass rounded"
      />
      <div className="flex justify-between text-xs text-cream/50 tabular-nums">
        <span>{FRET_COUNT_MIN}</span>
        <span>{FRET_COUNT_MAX}</span>
      </div>
    </div>
  )
}
