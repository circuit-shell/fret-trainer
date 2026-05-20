import { useEffect, useRef } from 'react'
import type { Settings } from '../domain/settings'
import { ReferenceToggle } from './ReferenceToggle'
import { ReferenceNamesToggle } from './ReferenceNamesToggle'
import { PianoLabelsToggle } from './PianoLabelsToggle'
import { BlackKeyLabelsToggle } from './BlackKeyLabelsToggle'
import { InlayDotsToggle } from './InlayDotsToggle'
import { FretNumbersTopToggle } from './FretNumbersTopToggle'
import { FretNumbersBottomToggle } from './FretNumbersBottomToggle'
import { StringNumbersToggle } from './StringNumbersToggle'
import { StringLinesToggle } from './StringLinesToggle'
import { NotationControl } from './NotationControl'
import { FretCountControl } from './FretCountControl'
import { SoundToggle } from './SoundToggle'
import { LanguageControl } from './LanguageControl'
import { clampFretCount } from '../domain/settings'
import { useTranslation } from '../hooks/useTranslation'

export interface SettingsDrawerProps {
  open: boolean
  settings: Settings
  onChange: <K extends keyof Settings>(key: K, value: Settings[K]) => void
  onResetDefaults: () => void
  onClose: () => void
}

export function SettingsDrawer({
  open,
  settings,
  onChange,
  onResetDefaults,
  onClose,
}: SettingsDrawerProps) {
  const t = useTranslation()
  const panelRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  // Close on Escape.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  // Move focus into the panel when it opens.
  useEffect(() => {
    if (open) closeButtonRef.current?.focus()
  }, [open])

  return (
    <div
      aria-hidden={!open}
      className={[
        'fixed inset-0 z-40 transition-opacity duration-200',
        open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
      ].join(' ')}
    >
      {/* Backdrop */}
      <div
        data-testid="settings-backdrop"
        onClick={onClose}
        className="absolute inset-0 bg-walnut-dark/70 backdrop-blur-sm"
      />

      {/* Panel — slides in from the right */}
      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={t('settings.title')}
        className={[
          'absolute top-0 right-0 h-full w-80 max-w-[90vw]',
          'bg-walnut-dark text-cream shadow-2xl ring-1 ring-walnut-light/60',
          'flex flex-col',
          'transition-transform duration-200',
          open ? 'translate-x-0' : 'translate-x-full',
        ].join(' ')}
      >
        <header className="flex items-center justify-between px-4 py-3 border-b border-walnut-light/40">
          <h2 className="font-display text-xl tracking-tight">{t('settings.title')}</h2>
          <button
            ref={closeButtonRef}
            type="button"
            aria-label={t('settings.close')}
            onClick={onClose}
            className="min-h-tap min-w-tap inline-flex items-center justify-center rounded-md p-1 text-cream/80 hover:text-cream hover:bg-walnut focus:outline-none focus-visible:ring-2 focus-visible:ring-brass"
          >
            <svg
              role="img"
              aria-label="close"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="w-6 h-6"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
          <section aria-label={t('settings.section.fretboard')}>
            <h3 className="text-xs sm:text-sm uppercase tracking-widest text-cream/60 mb-2">
              {t('settings.section.fretboard')}
            </h3>
            <div className="space-y-3">
              <FretCountControl
                value={settings.fretCount}
                onChange={(v) => onChange('fretCount', clampFretCount(v))}
              />
              <ReferenceToggle
                visible={settings.showReferenceMarkers}
                onChange={(v) => onChange('showReferenceMarkers', v)}
              />
              <ReferenceNamesToggle
                visible={settings.referenceNamesVisible}
                disabled={!settings.showReferenceMarkers}
                onChange={(v) => onChange('referenceNamesVisible', v)}
              />
              <InlayDotsToggle
                visible={settings.inlayDotsVisible}
                onChange={(v) => onChange('inlayDotsVisible', v)}
              />
              <FretNumbersTopToggle
                visible={settings.fretNumbersTopVisible}
                onChange={(v) => onChange('fretNumbersTopVisible', v)}
              />
              <FretNumbersBottomToggle
                visible={settings.fretNumbersBottomVisible}
                onChange={(v) => onChange('fretNumbersBottomVisible', v)}
              />
              <StringNumbersToggle
                visible={settings.stringNumbersVisible}
                onChange={(v) => onChange('stringNumbersVisible', v)}
              />
              <StringLinesToggle
                visible={settings.stringLinesVisible}
                onChange={(v) => onChange('stringLinesVisible', v)}
              />
            </div>
          </section>

          <section aria-label={t('settings.section.piano')}>
            <h3 className="text-xs sm:text-sm uppercase tracking-widest text-cream/60 mb-2">
              {t('settings.section.piano')}
            </h3>
            <div className="space-y-3">
              <PianoLabelsToggle
                visible={settings.pianoLabelsVisible}
                onChange={(v) => onChange('pianoLabelsVisible', v)}
              />
              <BlackKeyLabelsToggle
                visible={settings.blackKeyLabelsVisible}
                onChange={(v) => onChange('blackKeyLabelsVisible', v)}
              />
            </div>
          </section>

          <section aria-label={t('settings.section.audio')}>
            <h3 className="text-xs sm:text-sm uppercase tracking-widest text-cream/60 mb-2">
              {t('settings.section.audio')}
            </h3>
            <SoundToggle
              enabled={settings.soundEnabled}
              onChange={(v) => onChange('soundEnabled', v)}
            />
          </section>

          <section aria-label={t('settings.section.notation')}>
            <h3 className="text-xs sm:text-sm uppercase tracking-widest text-cream/60 mb-2">
              {t('settings.section.notation')}
            </h3>
            <NotationControl
              notation={settings.notation}
              onChange={(v) => onChange('notation', v)}
            />
          </section>

          <section aria-label={t('settings.section.language')}>
            <h3 className="text-xs sm:text-sm uppercase tracking-widest text-cream/60 mb-2">
              {t('settings.section.language')}
            </h3>
            <LanguageControl
              language={settings.language}
              onChange={(v) => onChange('language', v)}
            />
          </section>
        </div>

        <footer className="px-4 py-3 border-t border-walnut-light/40 space-y-2">
          <button
            type="button"
            onClick={onResetDefaults}
            className="w-full min-h-tap inline-flex items-center justify-center px-3 py-2 rounded-md border border-walnut-light bg-walnut text-cream hover:bg-walnut-light focus:outline-none focus-visible:ring-2 focus-visible:ring-brass"
          >
            {t('settings.resetDefaults')}
          </button>
          <p className="text-center text-xs text-cream/60 tracking-wide">
            {t('settings.createdBy')}{' '}
            <a
              href="https://github.com/circuit-shell/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-cream/30 hover:text-cream hover:decoration-cream focus:outline-none focus-visible:ring-2 focus-visible:ring-brass rounded-sm"
            >
              circuit-shell
            </a>
          </p>
        </footer>
      </aside>
    </div>
  )
}
