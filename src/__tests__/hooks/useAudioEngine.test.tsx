import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook } from '@testing-library/react'

// Mock the audioEngine singleton so this test exercises only the hook, not
// the engine itself. The engine's own behavior is covered by audio.test.ts.
// vi.hoisted lets us share the mock object with the vi.mock factory, which is
// itself hoisted above any normal top-level code.
const mockEngine = vi.hoisted(() => ({
  ensureReady: vi.fn().mockResolvedValue(undefined),
  playPiano: vi.fn(),
  playGuitar: vi.fn(),
  isReady: vi.fn().mockReturnValue(false),
  isUnavailable: vi.fn().mockReturnValue(false),
  playCount: 0,
}))

vi.mock('../../domain/audio', () => ({
  audioEngine: mockEngine,
}))

import { useAudioEngine } from '../../hooks/useAudioEngine'

beforeEach(() => {
  mockEngine.ensureReady.mockClear()
  mockEngine.playPiano.mockClear()
  mockEngine.playGuitar.mockClear()
})

describe('useAudioEngine', () => {
  it('returns no-op callbacks when soundEnabled is false (engine never touched)', () => {
    const { result } = renderHook(() => useAudioEngine(false))

    result.current.playPiano(0)
    result.current.playGuitar({ string: 6, fret: 3 })

    expect(mockEngine.playPiano).not.toHaveBeenCalled()
    expect(mockEngine.playGuitar).not.toHaveBeenCalled()
    expect(mockEngine.ensureReady).not.toHaveBeenCalled()
  })

  it('returns delegating callbacks when soundEnabled is true', () => {
    const { result } = renderHook(() => useAudioEngine(true))

    result.current.playPiano(6)
    result.current.playGuitar({ string: 6, fret: 3 })

    expect(mockEngine.playPiano).toHaveBeenCalledTimes(1)
    expect(mockEngine.playPiano).toHaveBeenCalledWith(6)
    expect(mockEngine.playGuitar).toHaveBeenCalledTimes(1)
    expect(mockEngine.playGuitar).toHaveBeenCalledWith({ string: 6, fret: 3 })
  })

  it('warms up the engine via ensureReady() on toggle-on', () => {
    const { rerender } = renderHook(({ enabled }) => useAudioEngine(enabled), {
      initialProps: { enabled: false },
    })
    expect(mockEngine.ensureReady).not.toHaveBeenCalled()

    rerender({ enabled: true })
    expect(mockEngine.ensureReady).toHaveBeenCalledTimes(1)

    // A subsequent re-render with the same value should not warm again.
    rerender({ enabled: true })
    expect(mockEngine.ensureReady).toHaveBeenCalledTimes(1)
  })

  it('returns referentially stable callbacks across renders with the same soundEnabled', () => {
    const { result, rerender } = renderHook(({ enabled }) => useAudioEngine(enabled), {
      initialProps: { enabled: true },
    })
    const first = result.current
    rerender({ enabled: true })
    expect(result.current).toBe(first)
    expect(result.current.playPiano).toBe(first.playPiano)
    expect(result.current.playGuitar).toBe(first.playGuitar)
  })

  it('returns a different (still stable) callback set when soundEnabled flips', () => {
    const { result, rerender } = renderHook(({ enabled }) => useAudioEngine(enabled), {
      initialProps: { enabled: false },
    })
    const offSet = result.current
    rerender({ enabled: true })
    expect(result.current).not.toBe(offSet)

    // Verify the off set was really no-ops.
    offSet.playPiano(0)
    expect(mockEngine.playPiano).not.toHaveBeenCalled()

    // And the on set really delegates.
    result.current.playPiano(0)
    expect(mockEngine.playPiano).toHaveBeenCalledTimes(1)
  })
})
