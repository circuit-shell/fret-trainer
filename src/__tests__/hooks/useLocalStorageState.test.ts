import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useLocalStorageState } from '../../hooks/useLocalStorageState'

describe('useLocalStorageState', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  afterEach(() => {
    window.localStorage.clear()
    vi.restoreAllMocks()
  })

  it('returns the default value when nothing is stored', () => {
    const { result } = renderHook(() => useLocalStorageState('test-key', { foo: 'bar' }))
    expect(result.current[0]).toEqual({ foo: 'bar' })
  })

  it('persists the value to localStorage on update', () => {
    const { result } = renderHook(() => useLocalStorageState('test-key', { foo: 'bar' }))
    act(() => {
      result.current[1]({ foo: 'baz' })
    })
    expect(result.current[0]).toEqual({ foo: 'baz' })
    expect(JSON.parse(window.localStorage.getItem('test-key')!)).toEqual({ foo: 'baz' })
  })

  it('hydrates the value from localStorage on next mount', () => {
    window.localStorage.setItem('test-key', JSON.stringify({ foo: 'persisted' }))
    const { result } = renderHook(() => useLocalStorageState('test-key', { foo: 'default' }))
    expect(result.current[0]).toEqual({ foo: 'persisted' })
  })

  it('merges a stored object with the default object (so new keys come through)', () => {
    window.localStorage.setItem('test-key', JSON.stringify({ a: 1 }))
    const { result } = renderHook(() => useLocalStorageState('test-key', { a: 0, b: 99 }))
    expect(result.current[0]).toEqual({ a: 1, b: 99 })
  })

  it('falls back to default when stored value is corrupt', () => {
    window.localStorage.setItem('test-key', '{not-json')
    const { result } = renderHook(() => useLocalStorageState('test-key', { foo: 'safe' }))
    expect(result.current[0]).toEqual({ foo: 'safe' })
  })

  it('supports functional updates', () => {
    const { result } = renderHook(() => useLocalStorageState<number>('test-key', 0))
    act(() => {
      result.current[1]((n) => n + 5)
    })
    expect(result.current[0]).toBe(5)
    expect(JSON.parse(window.localStorage.getItem('test-key')!)).toBe(5)
  })

  it('handles primitive (non-object) values without merging', () => {
    window.localStorage.setItem('test-key', JSON.stringify('hello'))
    const { result } = renderHook(() => useLocalStorageState<string>('test-key', 'world'))
    expect(result.current[0]).toBe('hello')
  })
})
