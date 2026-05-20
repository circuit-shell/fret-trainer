import { describe, it, expect } from 'vitest'
import { BREAKPOINTS, maxFretForViewport } from '../../domain/breakpoints'

describe('BREAKPOINTS', () => {
  it('exposes Tailwind-aligned breakpoints', () => {
    expect(BREAKPOINTS.sm).toBe(640)
    expect(BREAKPOINTS.md).toBe(768)
    expect(BREAKPOINTS.lg).toBe(1024)
    expect(BREAKPOINTS.xl).toBe(1280)
  })
})

describe('maxFretForViewport', () => {
  it('returns 12 for narrow mobile (< md)', () => {
    expect(maxFretForViewport(320)).toBe(12)
    expect(maxFretForViewport(640)).toBe(12)
    expect(maxFretForViewport(767)).toBe(12)
  })

  it('returns 15 for md (768–1023)', () => {
    expect(maxFretForViewport(768)).toBe(15)
    expect(maxFretForViewport(1000)).toBe(15)
  })

  it('returns 17 for lg (1024–1279)', () => {
    expect(maxFretForViewport(1024)).toBe(17)
    expect(maxFretForViewport(1200)).toBe(17)
  })

  it('returns 24 for xl and above (>= 1280)', () => {
    expect(maxFretForViewport(1280)).toBe(24)
    expect(maxFretForViewport(1920)).toBe(24)
  })
})
