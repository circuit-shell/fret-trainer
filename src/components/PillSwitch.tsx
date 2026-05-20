export interface PillSwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  /** Visible text label rendered to the right of the pill. */
  label: string
  /** Accessible name. Defaults to `label`. Override if the visible label is
   * not by itself enough context for screen readers. */
  ariaLabel?: string
  disabled?: boolean
}

/** A 2:1 pill-shaped toggle switch with a sliding circular knob. Used by all
 * boolean controls in the settings drawer.
 *
 * The accessible tap-target minimum (≥ 44 × 44 CSS px) is enforced on the
 * outer `<label>` via `min-h-tap`; the visible pill is intentionally smaller
 * (w-12 × h-6) so the shape reads as a pill rather than a circle. */
export function PillSwitch({
  checked,
  onChange,
  label,
  ariaLabel,
  disabled = false,
}: PillSwitchProps) {
  // When disabled, the brass-tinted "on" styling is dropped to make the
  // disabled state visually unambiguous. The underlying boolean is preserved
  // so re-enabling restores the prior visible state.
  const effectiveOn = checked && !disabled

  return (
    <label
      className={[
        'inline-flex items-center gap-3 select-none min-h-tap',
        disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',
      ].join(' ')}
    >
      <input
        type="checkbox"
        role="switch"
        aria-label={ariaLabel ?? label}
        aria-checked={checked}
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only peer"
      />
      <span
        aria-hidden="true"
        className={[
          'relative inline-block w-12 h-6 rounded-full transition-colors',
          'peer-focus-visible:ring-2 peer-focus-visible:ring-brass peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-walnut-dark',
          'border border-walnut-light/60',
          effectiveOn ? 'bg-brass' : 'bg-walnut',
        ].join(' ')}
      >
        <span
          className={[
            'absolute top-0.5 inline-block w-5 h-5 rounded-full bg-ivory shadow-md transition-transform',
            checked ? 'translate-x-6' : 'translate-x-0.5',
          ].join(' ')}
        />
      </span>
      <span className="text-cream font-body text-sm sm:text-base">{label}</span>
    </label>
  )
}
