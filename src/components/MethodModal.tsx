import { useEffect, useRef, useState } from 'react'
import { useTranslation } from '../hooks/useTranslation'

export interface MethodModalProps {
  open: boolean
  onClose: () => void
}

export function MethodModal({ open, onClose }: MethodModalProps) {
  const t = useTranslation()
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const [pageIndex, setPageIndex] = useState<0 | 1>(0)
  const pageTitles = [t('method.pageTitle.method'), t('method.pageTitle.usage')] as const

  // Reset to the first page whenever the modal opens, so reopening always
  // starts at "The Ted Greene method".
  useEffect(() => {
    if (open) setPageIndex(0)
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  useEffect(() => {
    if (open) closeButtonRef.current?.focus()
  }, [open])

  return (
    <div
      aria-hidden={!open}
      className={[
        'fixed inset-0 z-50 transition-opacity duration-200',
        open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
      ].join(' ')}
    >
      <div
        data-testid="method-modal-backdrop"
        onClick={onClose}
        className="absolute inset-0 bg-walnut-dark/80 backdrop-blur-sm"
      />

      {/* This flex container sits on top of the backdrop and would otherwise
          swallow all clicks. The `onClick` here closes the modal only when
          the click lands DIRECTLY on this container (not on the dialog or
          one of its descendants), so clicking anywhere outside the dialog
          but inside the modal area dismisses it. */}
      <div
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose()
        }}
        className="absolute inset-0 flex items-center justify-center p-4"
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-label={pageTitles[pageIndex]}
          className={[
            'relative w-full max-w-lg max-h-[85vh]',
            'bg-walnut-dark text-cream shadow-2xl ring-1 ring-walnut-light/60 rounded-lg',
            'flex flex-col',
            'transition-transform duration-200',
            open ? 'scale-100' : 'scale-95',
          ].join(' ')}
        >
          <header className="flex items-center justify-between px-5 py-3 border-b border-walnut-light/40">
            <h2 className="font-display text-xl sm:text-2xl tracking-tight">
              {pageTitles[pageIndex]}
            </h2>
            <button
              ref={closeButtonRef}
              type="button"
              aria-label={t('method.close')}
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

          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 text-sm sm:text-base leading-relaxed">
            {pageIndex === 0 ? <MethodPage /> : <UsagePage />}
          </div>

          <footer className="px-5 py-3 border-t border-walnut-light/40 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setPageIndex(0)}
              disabled={pageIndex === 0}
              aria-label="Previous page"
              className={[
                'min-h-tap inline-flex items-center justify-center px-3 py-2 rounded-md',
                'border border-walnut-light bg-walnut text-cream',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-brass',
                pageIndex === 0
                  ? 'opacity-40 cursor-not-allowed'
                  : 'hover:bg-walnut-light',
              ].join(' ')}
            >
              {t('method.back')}
            </button>

            <div
              aria-label={`Page ${pageIndex + 1} of ${pageTitles.length}`}
              className="flex-1 flex items-center justify-center gap-2"
            >
              {pageTitles.map((_, i) => (
                <span
                  key={i}
                  data-testid={`method-modal-dot-${i}`}
                  aria-hidden="true"
                  className={[
                    'inline-block w-2 h-2 rounded-full transition-colors',
                    i === pageIndex ? 'bg-brass' : 'bg-walnut-light/60',
                  ].join(' ')}
                />
              ))}
            </div>

            {pageIndex < pageTitles.length - 1 ? (
              <button
                type="button"
                onClick={() => setPageIndex(1)}
                aria-label="Next page"
                className="min-h-tap inline-flex items-center justify-center px-3 py-2 rounded-md border border-walnut-light bg-walnut text-cream hover:bg-walnut-light focus:outline-none focus-visible:ring-2 focus-visible:ring-brass"
              >
                {t('method.next')}
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="min-h-tap inline-flex items-center justify-center px-3 py-2 rounded-md border border-brass-light bg-brass text-walnut-dark font-medium hover:bg-brass-light focus:outline-none focus-visible:ring-2 focus-visible:ring-brass"
              >
                {t('method.gotIt')}
              </button>
            )}
          </footer>
        </div>
      </div>
    </div>
  )
}

function MethodPage() {
  return (
    <>
      <p>
        Ted Greene built his fretboard knowledge by treating every note as a
        landmark he could find without thinking. In <em>Chord Chemistry</em> he
        insisted that before any chord work, the student should know{' '}
        <strong>every note on every string</strong>, by name, instantly.
      </p>

      <section>
        <h3 className="font-display text-lg text-brass-light mb-1">
          1. Start with the naturals
        </h3>
        <p>
          Ignore sharps and flats at first. Memorize the seven natural notes
          (A, B, C, D, E, F, G) along each string. Sharps and flats slot
          themselves in once the naturals are second nature.
        </p>
      </section>

      <section>
        <h3 className="font-display text-lg text-brass-light mb-1">
          2. Anchor on the low E and A strings
        </h3>
        <p>
          These two strings are your map. Most chord roots live here, and
          octave shapes radiate from them. Drill the naturals on E and A
          until you can name any fret without hesitation.
        </p>
      </section>

      <section>
        <h3 className="font-display text-lg text-brass-light mb-1">
          3. Use the inlay dots as guides
        </h3>
        <p>
          The dots at frets 3, 5, 7, 9, and 12 are reference points. Learn
          the notes that sit on them first — they become the hooks you hang
          every other note on.
        </p>
      </section>

      <section>
        <h3 className="font-display text-lg text-brass-light mb-1">
          4. One note, all over the neck
        </h3>
        <p>
          Pick a single note — say C — and find every C on the fretboard,
          low to high. Then move to the next note. Ted called this drilling
          a note <em>&ldquo;around the neck&rdquo;</em>; it forges the visual
          map far faster than running scales.
        </p>
      </section>

      <section>
        <h3 className="font-display text-lg text-brass-light mb-1">
          5. Test yourself randomly
        </h3>
        <p>
          Random recall is the real test. A note you can only find by
          counting up from the open string isn&rsquo;t learned yet. That is
          what this trainer is for: it picks a note, you find it on the
          fretboard, and over time the hesitation disappears.
        </p>
      </section>

      <p className="text-cream/70 italic pt-1">
        &ldquo;Know the notes first. Everything else follows.&rdquo; — paraphrased
        from Ted Greene&rsquo;s teaching notes.
      </p>
    </>
  )
}

function UsagePage() {
  return (
    <>
      <p>
        The app turns the Ted Greene drill into a tight feedback loop. Pick a
        target note, find it on every string, and the timer tracks how long
        the round takes. Here&rsquo;s how each piece works.
      </p>

      <section>
        <h3 className="font-display text-lg text-brass-light mb-1">
          Find the note
        </h3>
        <p>
          The big label at the top shows the current target. <strong>Tap it</strong>{' '}
          to roll a random note (with audio if sound is enabled). On first load
          it shows a treble-clef placeholder — tap that to start your first round.
        </p>
      </section>

      <section>
        <h3 className="font-display text-lg text-brass-light mb-1">
          Piano picker
        </h3>
        <p>
          Tap any piano key to pick a specific note as the target. Keys with two
          valid names — C/B#, E/Fb, F/E#, B/Cb, and every black key (C#/Db etc.) —
          remember which name you tapped: tap the same key again to flip to the
          other name. D, G, and A only have one name each and just restart the round.
        </p>
      </section>

      <section>
        <h3 className="font-display text-lg text-brass-light mb-1">
          The fretboard
        </h3>
        <p>
          Tap any cell to make an attempt. A green check means you found the
          target note on that string; a red cross means that cell isn&rsquo;t
          the target. Find a correct cell on all six strings and the round
          completes — a banner appears with a one-tap shortcut to the next
          random note.
        </p>
        <p className="text-cream/70 text-xs sm:text-sm mt-1">
          Inlay dots, reference notes, fret numbers, and string numbers can
          each be toggled in Settings.
        </p>
      </section>

      <section>
        <h3 className="font-display text-lg text-brass-light mb-1">
          Session timer
        </h3>
        <p>
          Tap the timer to start/pause. The reset icon clears the timer and
          the current round. The timer caps at 15 minutes — Ted&rsquo;s
          suggested focused-practice block.
        </p>
      </section>

      <section>
        <h3 className="font-display text-lg text-brass-light mb-1">Settings</h3>
        <p>
          The gear icon opens a drawer with every preference: which visual
          aids are showing (inlay dots, reference notes, fret/string numbers,
          piano labels), the notation (Letters or Solfège), how many frets to
          show (12 to 24), and whether <strong>Sound</strong> is on. With sound
          enabled, tapping a piano key plays the corresponding pitch, tapping a
          fret plays the actual guitar pitch at that position, and rolling a
          random note plays that pitch too.
        </p>
        <p className="text-cream/70 text-xs sm:text-sm mt-1">
          All settings persist across browser sessions. The Reset to defaults
          button at the bottom of the drawer restores everything at once.
        </p>
      </section>
    </>
  )
}
