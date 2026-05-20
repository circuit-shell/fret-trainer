import type { NotationSystem } from '../domain/notation'

export interface NotationControlProps {
  notation: NotationSystem
  onChange: (next: NotationSystem) => void
}

const OPTIONS: ReadonlyArray<{ value: NotationSystem; label: string; sample: string }> = [
  { value: 'letter', label: 'Letters', sample: 'A B C' },
  { value: 'solfege', label: 'Solfège', sample: 'La Si Do' },
]

export function NotationControl({ notation, onChange }: NotationControlProps) {
  return (
    <div
      role="group"
      aria-label="Notation system"
      className="inline-flex items-center gap-1 rounded-md border border-walnut-light bg-walnut-dark/40 p-0.5"
    >
      {OPTIONS.map((opt) => {
        const pressed = opt.value === notation
        return (
          <button
            key={opt.value}
            type="button"
            aria-pressed={pressed}
            aria-label={`${opt.label} notation (${opt.sample})`}
            onClick={() => onChange(opt.value)}
            className={[
              'min-h-tap px-3 py-1.5 rounded font-display text-sm tracking-wide',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-brass',
              pressed
                ? 'bg-brass text-walnut-dark shadow-inner'
                : 'text-cream/80 hover:bg-walnut hover:text-cream',
            ].join(' ')}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
