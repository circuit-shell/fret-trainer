import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSessionTimer, MAX_DURATION_MS } from '../../hooks/useSessionTimer'

describe('useSessionTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-05-18T10:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('starts in the idle state with 0 elapsed and isAtCap=false', () => {
    const { result } = renderHook(() => useSessionTimer())
    expect(result.current.status).toBe('idle')
    expect(result.current.elapsedMs).toBe(0)
    expect(result.current.isAtCap).toBe(false)
  })

  describe('toggle()', () => {
    it('idle → running on first toggle', () => {
      const { result } = renderHook(() => useSessionTimer())
      act(() => {
        result.current.toggle()
      })
      expect(result.current.status).toBe('running')
    })

    it('running → paused on second toggle', () => {
      const { result } = renderHook(() => useSessionTimer())
      act(() => {
        result.current.toggle()
      })
      act(() => {
        vi.advanceTimersByTime(2_000)
      })
      act(() => {
        result.current.toggle()
      })
      expect(result.current.status).toBe('paused')
    })

    it('paused → running on third toggle (resume)', () => {
      const { result } = renderHook(() => useSessionTimer())
      act(() => {
        result.current.toggle()
      })
      act(() => {
        vi.advanceTimersByTime(2_000)
      })
      act(() => {
        result.current.toggle()
      })
      act(() => {
        result.current.toggle()
      })
      expect(result.current.status).toBe('running')
    })

    it('pause freezes elapsedMs; resume continues from the frozen value', () => {
      const { result } = renderHook(() => useSessionTimer())
      act(() => {
        result.current.toggle()
      })
      act(() => {
        vi.advanceTimersByTime(3_000)
      })
      act(() => {
        result.current.toggle() // pause
      })
      const frozen = result.current.elapsedMs
      act(() => {
        vi.advanceTimersByTime(10_000)
      })
      expect(result.current.elapsedMs).toBe(frozen)
      act(() => {
        result.current.toggle() // resume
      })
      act(() => {
        vi.advanceTimersByTime(2_000)
      })
      expect(result.current.elapsedMs).toBeGreaterThanOrEqual(frozen + 2_000)
      expect(result.current.elapsedMs).toBeLessThan(frozen + 2_500)
    })
  })

  describe('15-minute cap', () => {
    it('auto-pauses at MAX_DURATION_MS', () => {
      const { result } = renderHook(() => useSessionTimer())
      act(() => {
        result.current.toggle()
      })
      act(() => {
        vi.advanceTimersByTime(MAX_DURATION_MS + 5_000)
      })
      expect(result.current.status).toBe('paused')
      expect(result.current.elapsedMs).toBe(MAX_DURATION_MS)
      expect(result.current.isAtCap).toBe(true)
    })

    it('elapsedMs is clamped to MAX_DURATION_MS even past the cap', () => {
      const { result } = renderHook(() => useSessionTimer())
      act(() => {
        result.current.toggle()
      })
      act(() => {
        vi.advanceTimersByTime(MAX_DURATION_MS * 3)
      })
      expect(result.current.elapsedMs).toBe(MAX_DURATION_MS)
    })

    it('toggle (resume) is a no-op once the cap is hit', () => {
      const { result } = renderHook(() => useSessionTimer())
      act(() => {
        result.current.toggle()
      })
      act(() => {
        vi.advanceTimersByTime(MAX_DURATION_MS + 1_000)
      })
      expect(result.current.isAtCap).toBe(true)
      act(() => {
        result.current.toggle() // attempt to resume past cap
      })
      expect(result.current.status).toBe('paused')
      expect(result.current.elapsedMs).toBe(MAX_DURATION_MS)
    })

    it('reset() clears the cap so the timer can run again', () => {
      const { result } = renderHook(() => useSessionTimer())
      act(() => {
        result.current.toggle()
      })
      act(() => {
        vi.advanceTimersByTime(MAX_DURATION_MS + 1_000)
      })
      expect(result.current.isAtCap).toBe(true)
      act(() => {
        result.current.reset()
      })
      expect(result.current.status).toBe('idle')
      expect(result.current.elapsedMs).toBe(0)
      expect(result.current.isAtCap).toBe(false)
      // And the timer is usable again.
      act(() => {
        result.current.toggle()
      })
      expect(result.current.status).toBe('running')
    })
  })

  it('reset() returns to idle and zero', () => {
    const { result } = renderHook(() => useSessionTimer())
    act(() => {
      result.current.toggle()
    })
    act(() => {
      vi.advanceTimersByTime(10_000)
    })
    act(() => {
      result.current.reset()
    })
    expect(result.current.status).toBe('idle')
    expect(result.current.elapsedMs).toBe(0)
  })
})
