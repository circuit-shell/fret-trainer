import { useCallback, useEffect, useState } from 'react'

export type TimerStatus = 'idle' | 'running' | 'paused'

// Hard cap for a single practice session. When elapsed reaches this value the
// timer auto-pauses; further toggle() calls are no-ops until the user resets.
export const MAX_DURATION_MS = 15 * 60 * 1000 // 15 minutes

interface InternalState {
  status: TimerStatus
  startedAt: number | null
  pausedAccumulatorMs: number
  pauseStartedAt: number | null
}

export interface UseSessionTimerResult {
  status: TimerStatus
  elapsedMs: number
  // Single tap-style gesture for play/pause:
  //   idle    → start
  //   running → pause
  //   paused  → resume (unless we're at the 15-min cap, then no-op)
  toggle: () => void
  reset: () => void
  // True when elapsed has reached MAX_DURATION_MS and the timer auto-stopped.
  isAtCap: boolean
}

const INITIAL: InternalState = {
  status: 'idle',
  startedAt: null,
  pausedAccumulatorMs: 0,
  pauseStartedAt: null,
}

function rawElapsed(s: InternalState, now: number): number {
  if (s.status === 'idle' || s.startedAt === null) return 0
  const currentPause =
    s.status === 'paused' && s.pauseStartedAt !== null ? now - s.pauseStartedAt : 0
  return now - s.startedAt - s.pausedAccumulatorMs - currentPause
}

function computeElapsed(s: InternalState, now: number): number {
  return Math.min(rawElapsed(s, now), MAX_DURATION_MS)
}

export function useSessionTimer(): UseSessionTimerResult {
  const [state, setState] = useState<InternalState>(INITIAL)
  const [now, setNow] = useState<number>(() => Date.now())

  // Drive re-renders every 250ms while running so the display updates, and
  // auto-pause the moment we cross the 15-min cap. Both happen inside the
  // setInterval callback (a subscription-style updater) rather than directly
  // in the effect body, which keeps the React linter happy and avoids
  // cascading renders.
  useEffect(() => {
    if (state.status !== 'running' || state.startedAt === null) return
    const id = setInterval(() => {
      const t = Date.now()
      setNow(t)
      if (rawElapsed(state, t) >= MAX_DURATION_MS) {
        setState((prev) => {
          if (prev.status !== 'running' || prev.startedAt === null) return prev
          // Pin pauseStartedAt so the displayed elapsed stays exactly at MAX.
          const capMoment = prev.startedAt + prev.pausedAccumulatorMs + MAX_DURATION_MS
          return { ...prev, status: 'paused', pauseStartedAt: capMoment }
        })
      }
    }, 250)
    return () => clearInterval(id)
  }, [state])

  const start = useCallback(() => {
    setState((prev) => {
      if (prev.status !== 'idle') return prev
      const t = Date.now()
      setNow(t)
      return {
        status: 'running',
        startedAt: t,
        pausedAccumulatorMs: 0,
        pauseStartedAt: null,
      }
    })
  }, [])

  const pause = useCallback(() => {
    setState((prev) => {
      if (prev.status !== 'running') return prev
      const t = Date.now()
      setNow(t)
      return { ...prev, status: 'paused', pauseStartedAt: t }
    })
  }, [])

  const resume = useCallback(() => {
    setState((prev) => {
      if (prev.status !== 'paused' || prev.pauseStartedAt === null) return prev
      // Block resume past the cap: if we are sitting at MAX_DURATION_MS the
      // user must reset before the timer can move again.
      if (rawElapsed(prev, Date.now()) >= MAX_DURATION_MS) return prev
      const t = Date.now()
      setNow(t)
      return {
        ...prev,
        status: 'running',
        pausedAccumulatorMs: prev.pausedAccumulatorMs + (t - prev.pauseStartedAt),
        pauseStartedAt: null,
      }
    })
  }, [])

  const reset = useCallback(() => {
    setState(INITIAL)
    setNow(Date.now())
  }, [])

  const toggle = useCallback(() => {
    if (state.status === 'idle') {
      start()
      return
    }
    if (state.status === 'running') {
      pause()
      return
    }
    // status === 'paused': try to resume (no-op past the cap, by design)
    resume()
  }, [state.status, start, pause, resume])

  const elapsedMs = computeElapsed(state, now)
  const isAtCap = elapsedMs >= MAX_DURATION_MS

  return {
    status: state.status,
    elapsedMs,
    toggle,
    reset,
    isAtCap,
  }
}
