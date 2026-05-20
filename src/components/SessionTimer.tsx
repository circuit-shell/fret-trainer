import type { TimerStatus } from '../hooks/useSessionTimer'
import { formatElapsed } from '../domain/formatElapsed'
import { useTranslation } from '../hooks/useTranslation'

export interface SessionTimerProps {
  status: TimerStatus
  elapsedMs: number
  isAtCap: boolean
  onToggle: () => void
  onReset: () => void
}

// Reset icon: a circular arrow that reads as "start over". Inline SVG so it
// inherits color via `currentColor` from the surrounding text.
function ResetIcon({ className }: { className?: string }) {
  return (
    <svg
      role="img"
      aria-label="reset"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Three-quarter arc + arrowhead suggesting "restart" */}
      <path d="M3 12a9 9 0 1 0 3-6.7" />
      <polyline points="3 4 3 9 8 9" />
    </svg>
  )
}

export function SessionTimer({ status, elapsedMs, isAtCap, onToggle, onReset }: SessionTimerProps) {
  const t = useTranslation()
  const toggleLabel =
    status === 'idle'
      ? 'Start session timer'
      : status === 'running'
        ? 'Pause session timer'
        : isAtCap
          ? 'Session timer reached 15-minute cap'
          : 'Resume session timer'

  return (
    // The whole timer group acts as one hover surface: hovering anywhere
    // inside (including the reset button area) darkens the background and
    // scales the digits, matching the Find-the-note box's feel. `group` on
    // the wrapper drives the inner `group-hover:scale-[1.03]` on the digits.
    <div
      role="group"
      aria-label="Session timer"
      className={[
        // `relative` anchors the absolutely-positioned reset button. The
        // toggle button becomes the only in-flow child so `justify-center`
        // centers it exactly the way TargetNoteDisplay's single-button
        // layout does — meaning the two titles line up to the pixel between
        // the boxes regardless of the reset button's presence.
        'relative group flex flex-col items-center justify-center gap-1',
        'px-6 py-3 rounded-lg',
        // Same min dimensions as TargetNoteDisplay so the two boxes occupy
        // identical hover area regardless of which language is active.
        'min-w-[12rem] sm:min-w-[14rem] min-h-[13rem] sm:min-h-[14.5rem]',
        'border border-walnut-light/40',
        'bg-transparent',
        'transition-colors',
        isAtCap ? '' : 'hover:bg-walnut/30 active:bg-walnut/40',
      ].join(' ')}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-label={toggleLabel}
        disabled={isAtCap}
        className={[
          'inline-flex flex-col items-center gap-1',
          'rounded-lg',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-brass',
          isAtCap ? 'cursor-not-allowed' : 'cursor-pointer',
        ].join(' ')}
      >
        {/* Two-row title with the same sizing as TargetNoteDisplay so the
            two boxes match. `whitespace-nowrap` keeps each row on one line
            even if it's narrower than the longest counterpart in the other
            language. */}
        <span className="flex flex-col items-center leading-tight text-cream/60 text-[10px] sm:text-xs tracking-widest uppercase text-center">
          <span className="whitespace-nowrap">{t('timer.label.row1')}</span>
          <span className="whitespace-nowrap">{t('timer.label.row2')}</span>
        </span>
        {/* Fixed-size stage matches TargetNoteDisplay's so the two boxes
            occupy identical area regardless of content. font-mono guarantees
            equal-width characters (digits AND colon), so the MM:SS doesn't
            jiggle as digits change. The gentle scale-up on group-hover
            mirrors the find-the-notes value's hover treatment. */}
        <span
          className="flex items-center justify-center h-24 sm:h-28 min-w-[9rem] sm:min-w-[11rem]"
          aria-live="polite"
        >
          <span
            className={[
              'inline-block font-mono tabular-nums tracking-wider leading-none',
              'text-4xl sm:text-5xl',
              'drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]',
              // While the timer is actively counting, the digits glow brass-
              // light (the same yellow the selected piano key uses).
              // Paused/idle reads as plain ivory; the at-cap state dims it.
              'transition-[color,transform]',
              isAtCap
                ? 'text-cream/50'
                : status === 'running'
                  ? 'text-brass-light group-hover:scale-[1.03]'
                  : 'text-ivory group-hover:scale-[1.03]',
            ].join(' ')}
          >
            {formatElapsed(elapsedMs)}
          </span>
        </span>
      </button>
      <button
        type="button"
        onClick={onReset}
        aria-label="Reset session timer"
        className={[
          // Pinned to the bottom-right corner of the box (out of flow) so
          // it doesn't push the centered toggle button upward.
          'absolute bottom-3 right-3 inline-flex items-center justify-center',
          'p-1 rounded-full border border-walnut-light bg-walnut-dark/40',
          'text-cream/70 hover:text-cream hover:bg-walnut hover:border-brass',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-brass',
          'transition-colors',
        ].join(' ')}
      >
        <ResetIcon className="w-5 h-5" />
      </button>
    </div>
  )
}
