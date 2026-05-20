import { LANGUAGES, type Language } from '../domain/i18n'

export interface LanguageControlProps {
  language: Language
  onChange: (next: Language) => void
}

/** A styled native `<select>` so language switching benefits from the
 * platform's accessibility (keyboard navigation, screen-reader rotor,
 * mobile-native picker) for free. Wrapping `<label>` ties the click target
 * to the select. New languages added to `LANGUAGES` in domain/i18n.ts
 * appear here automatically. */
export function LanguageControl({ language, onChange }: LanguageControlProps) {
  return (
    <label className="inline-flex items-center gap-3 cursor-pointer select-none min-h-tap">
      <span className="text-cream font-body text-sm sm:text-base">Language</span>
      <span className="relative inline-block">
        <select
          aria-label="Language"
          value={language}
          onChange={(e) => onChange(e.target.value as Language)}
          className={[
            'appearance-none cursor-pointer',
            'rounded-md border border-walnut-light bg-walnut-dark text-cream',
            'pl-3 pr-8 py-1.5',
            'font-display text-sm tracking-wide',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-brass',
            'hover:bg-walnut',
            'transition-colors',
          ].join(' ')}
        >
          {LANGUAGES.map((l) => (
            <option key={l.code} value={l.code} className="bg-walnut-dark text-cream">
              {l.label}
            </option>
          ))}
        </select>
        {/* Caret — purely decorative; `aria-hidden` because the native
            select's accessibility tree already conveys "this is a dropdown". */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-cream/70"
        >
          ▾
        </span>
      </span>
    </label>
  )
}
