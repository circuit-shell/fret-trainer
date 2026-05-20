import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useViewportWidth } from '../../hooks/useViewportWidth'

describe('useViewportWidth', () => {
  const originalInnerWidth = window.innerWidth

  beforeEach(() => {
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1024 })
  })

  afterEach(() => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    })
  })

  it('returns the current window.innerWidth on first render', () => {
    const { result } = renderHook(() => useViewportWidth())
    expect(result.current).toBe(1024)
  })

  it('updates when the window resizes', () => {
    const { result } = renderHook(() => useViewportWidth())
    act(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })
      window.dispatchEvent(new Event('resize'))
    })
    expect(result.current).toBe(375)
  })
})
