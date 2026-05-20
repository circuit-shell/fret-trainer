export interface RoundCompleteBannerProps {
  visible: boolean
  onNextRandom: () => void
}

export function RoundCompleteBanner({ visible, onNextRandom }: RoundCompleteBannerProps) {
  if (!visible) return null
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center gap-3 px-4 py-3 rounded-md border border-jazz-green/60 bg-jazz-green/15 text-ivory"
    >
      <span className="font-display text-lg">Found on all six strings — nice.</span>
      <button
        type="button"
        onClick={onNextRandom}
        className="min-h-tap ml-auto px-4 py-2 rounded-md bg-brass text-walnut-dark font-display hover:bg-brass-light focus:outline-none focus-visible:ring-2 focus-visible:ring-ivory"
      >
        Next random note
      </button>
    </div>
  )
}
