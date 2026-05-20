import { useCallback, useState } from 'react'
import { useRound } from './hooks/useRound'
import { useSessionTimer } from './hooks/useSessionTimer'
import { useLocalStorageState } from './hooks/useLocalStorageState'
import { useAudioEngine } from './hooks/useAudioEngine'
import { useViewportWidth } from './hooks/useViewportWidth'
import { LanguageProvider } from './hooks/useTranslation'
import { translate } from './domain/i18n'
import { nextRandomTarget } from './domain/randomizer'
import { slotCount } from './domain/notation'
import { BREAKPOINTS } from './domain/breakpoints'
import {
  DEFAULT_SETTINGS,
  SETTINGS_STORAGE_KEY,
  clampFretCount,
  type Settings,
} from './domain/settings'
import type { Note } from './domain/notes'
import { TargetNoteDisplay } from './components/TargetNoteDisplay'
import { Piano } from './components/Piano'
import { Fretboard } from './components/Fretboard'
import { RoundCompleteBanner } from './components/RoundCompleteBanner'
import { SessionTimer } from './components/SessionTimer'
import { SettingsButton } from './components/SettingsButton'
import { SettingsDrawer } from './components/SettingsDrawer'
import { MethodModal } from './components/MethodModal'

function App() {
  const { round, startRound, tap, resetRound } = useRound()
  const timer = useSessionTimer()
  const [settings, setSettings] = useLocalStorageState<Settings>(
    SETTINGS_STORAGE_KEY,
    DEFAULT_SETTINGS,
  )
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [methodModalOpen, setMethodModalOpen] = useState(false)
  const maxFret = clampFretCount(settings.fretCount)
  const audio = useAudioEngine(settings.soundEnabled)
  // Below the `sm` breakpoint (640px), the fretboard renders vertically —
  // strings as columns, frets as rows, nut at the top — so phones in portrait
  // don't need a horizontal scroll to see all 12 frets.
  const viewportWidth = useViewportWidth()
  const verticalFretboard = viewportWidth < BREAKPOINTS.sm
  // Pick a string-row height that fits the available viewport width without
  // clipping the outermost strings (string 6 on the left, string 1 on the
  // right of the rotated view). Subtract ~96 px for the section padding,
  // wrapper margins, the fret-number slots (which become left/right strips
  // after rotation), and the outer Fretboard padding. Cap at 44 px on the
  // low end (accessibility tap-target) and 72 px on the high end (don't
  // get absurdly wide on tablet-sized portrait viewports).
  const verticalStringRowHeight = Math.max(
    44,
    Math.min(72, Math.floor((viewportWidth - 96) / 6)),
  )

  const handleSelect = useCallback(
    (note: Note) => {
      // Tapping the SAME pitch class as the current target cycles to the next
      // valid name slot for that pitch (e.g. C → B# → C, or C# → Db → C#).
      // Keys with only one name (D, G, A) just restart the round on slot 0.
      // Tapping a DIFFERENT pitch starts fresh with the primary name (slot 0).
      const sameAsCurrent = round !== null && round.targetNote.index === note.index
      const nextSlot = sameAsCurrent
        ? (round.targetSlot + 1) % slotCount(note.index)
        : 0
      startRound(note, nextSlot)
    },
    [round, startRound],
  )

  const handleRandom = useCallback(() => {
    const previous =
      round === null ? null : { note: round.targetNote, slot: round.targetSlot }
    const next = nextRandomTarget(previous)
    startRound(next.note, next.slot)
    // Play the rolled note's pitch through the piano so the user hears the
    // target. The audio hook returns a no-op callback when Sound is disabled,
    // so this stays silent unless the user has opted in.
    audio.playPiano(next.note.index)
  }, [round, startRound, audio])

  const handleResetSession = useCallback(() => {
    timer.reset()
    resetRound()
  }, [timer, resetRound])

  const updateSetting = useCallback(
    <K extends keyof Settings>(key: K, value: Settings[K]) => {
      setSettings((prev) => ({ ...prev, [key]: value }))
    },
    [setSettings],
  )

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS)
  }, [setSettings])

  // App-level translator. Components below the provider use the
  // `useTranslation` hook; this local `t` lets App itself translate strings
  // without needing to nest itself inside its own provider.
  const t = (key: string) => translate(settings.language, key)

  return (
    <LanguageProvider value={settings.language}>
    <main className="min-h-screen flex flex-col items-stretch text-cream font-body">
      <header className="px-4 py-4 sm:py-6 border-b border-walnut-light/40 bg-walnut-dark/60 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => setMethodModalOpen(true)}
            aria-label={t('app.aria.openMethod')}
            className="text-left -m-1 p-1 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-brass hover:text-cream transition-colors"
          >
            <h1 className="font-display text-2xl sm:text-3xl text-cream tracking-wider leading-none">
              FretTrainer
            </h1>
            <p className="font-body text-[11px] sm:text-sm text-cream/70 tracking-wide mt-0.5 leading-snug">
              {t('app.subtitle')}
            </p>
          </button>
          <SettingsButton onClick={() => setDrawerOpen(true)} />
        </div>
      </header>

      {/* Content cap: everything below the nav is constrained to 1500 px and
          centered. The header stays full-width (sits outside this wrapper)
          so its border/background spans the viewport edge-to-edge on large
          screens. */}
      <div className="w-full max-w-[1500px] mx-auto">
      <section
        aria-label="Practice stage"
        className="py-6 sm:py-8 w-full max-w-xl mx-auto"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 flex justify-center">
            <TargetNoteDisplay
              note={round?.targetNote ?? null}
              slot={round?.targetSlot ?? 0}
              notation={settings.notation}
              onRandom={handleRandom}
            />
          </div>
          <div className="flex-1 flex justify-center">
            <SessionTimer
              status={timer.status}
              elapsedMs={timer.elapsedMs}
              isAtCap={timer.isAtCap}
              onToggle={timer.toggle}
              onReset={handleResetSession}
            />
          </div>
        </div>
      </section>

      <section aria-label="Note picker" className="px-4 pb-4 sm:pb-6">
        <Piano
          selectedNoteIndex={round?.targetNote.index ?? null}
          whiteLabelsVisible={settings.pianoLabelsVisible}
          blackLabelsVisible={settings.blackKeyLabelsVisible}
          notation={settings.notation}
          onSelect={handleSelect}
          onKeyAudio={audio.playPiano}
        />
      </section>

      <section aria-label="Fretboard" className="px-2 sm:px-4 pb-6">
        {/* On narrow mobile (< 640 px) the whole fretboard is rotated 90°
            clockwise via CSS so the strings run top-to-bottom and the nut
            sits at the top of the screen. CSS rotation doesn't reflow
            layout — the wrapper's bounding box stays at the UNROTATED
            dimensions of the fretboard — so we need to reserve enough
            vertical space for the rotated content (which is as tall as the
            unrotated board is wide). The board is wider with more frets, so
            we compute the height from `maxFret`: roughly
            (maxFret + 2 cells) × 44 px min + breathing. `fretboard-rotated`
            triggers the descendant-text counter-rotation in index.css.
            Margin (not padding) on the outer wrapper is what pushes the box
            away from siblings (piano above, round-status below). */}
        <div
          className={
            verticalFretboard
              ? 'flex items-center justify-center fretboard-rotated mt-1 mx-6 mb-6 sm:mt-2 sm:mx-8 sm:mb-8'
              : ''
          }
          style={
            verticalFretboard
              ? ({
                  // Vertical extent that fits the rotated fretboard (whose
                  // visual height is the unrotated WIDTH ≈ (maxFret + 2)
                  // columns × 44 px each, plus breathing).
                  minHeight: (maxFret + 2) * 44 + 96,
                  // Each string row is bumped to this height so the rotated
                  // playing area looks wider; the CSS rule in index.css reads
                  // this variable via `grid-auto-rows: var(--rotated-row-h)`.
                  '--rotated-row-h': `${verticalStringRowHeight}px`,
                } as React.CSSProperties)
              : undefined
          }
        >
          <div className={verticalFretboard ? 'rotate-90 origin-center' : ''}>
            <Fretboard
              maxFret={maxFret}
              attempts={round?.attempts ?? []}
              referenceMarkersVisible={settings.showReferenceMarkers}
              referenceNamesVisible={settings.referenceNamesVisible}
              fretNumbersTopVisible={settings.fretNumbersTopVisible}
              fretNumbersBottomVisible={settings.fretNumbersBottomVisible}
              inlayDotsVisible={settings.inlayDotsVisible}
              stringNumbersVisible={settings.stringNumbersVisible}
              stringLinesVisible={settings.stringLinesVisible}
              notation={settings.notation}
              onTap={tap}
              onAudio={audio.playGuitar}
            />
          </div>
        </div>
      </section>

      <section
        aria-label="Round status"
        className="px-4 pb-6 flex items-center justify-end"
      >
        <RoundCompleteBanner visible={round?.isComplete ?? false} onNextRandom={handleRandom} />
      </section>
      </div>

      <SettingsDrawer
        open={drawerOpen}
        settings={settings}
        onChange={updateSetting}
        onResetDefaults={resetSettings}
        onClose={() => setDrawerOpen(false)}
      />

      <MethodModal
        open={methodModalOpen}
        onClose={() => setMethodModalOpen(false)}
      />
    </main>
    </LanguageProvider>
  )
}

export default App
