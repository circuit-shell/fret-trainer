import { describe, it, expect } from 'vitest'
import {
  DEFAULT_SETTINGS,
  FRET_COUNT_MAX,
  FRET_COUNT_MIN,
  clampFretCount,
} from '../../domain/settings'

describe('settings', () => {
  it('defaults fretCount to the minimum (12)', () => {
    expect(DEFAULT_SETTINGS.fretCount).toBe(FRET_COUNT_MIN)
    expect(FRET_COUNT_MIN).toBe(12)
    expect(FRET_COUNT_MAX).toBe(24)
  })

  it('defaults soundEnabled to false (off by default, see spec Assumptions)', () => {
    expect(DEFAULT_SETTINGS.soundEnabled).toBe(false)
  })

  it('soundEnabled is a typed boolean on the Settings shape', () => {
    // Type-only check: this would fail to compile if the field's type drifted.
    const ok: boolean = DEFAULT_SETTINGS.soundEnabled
    expect(typeof ok).toBe('boolean')
  })

  it('older persisted blobs lacking soundEnabled merge to the default via {...default, ...parsed}', () => {
    // useLocalStorageState does `{ ...defaultValue, ...parsed }` on read. We
    // mimic that shape here to assert older blobs upgrade cleanly without a
    // storage version bump.
    const olderBlob = {
      showReferenceMarkers: true,
      referenceNamesVisible: true,
      pianoLabelsVisible: true,
      blackKeyLabelsVisible: true,
      inlayDotsVisible: true,
      fretNumbersTopVisible: false,
      fretNumbersBottomVisible: false,
      notation: DEFAULT_SETTINGS.notation,
      fretCount: 12,
      // intentionally no soundEnabled
    }
    const merged = { ...DEFAULT_SETTINGS, ...olderBlob }
    expect(merged.soundEnabled).toBe(false)
    expect(merged.fretCount).toBe(12)
  })

  describe('clampFretCount', () => {
    it('returns the value when in range', () => {
      expect(clampFretCount(12)).toBe(12)
      expect(clampFretCount(18)).toBe(18)
      expect(clampFretCount(24)).toBe(24)
    })

    it('clamps below-min values up to 12', () => {
      expect(clampFretCount(0)).toBe(12)
      expect(clampFretCount(-5)).toBe(12)
      expect(clampFretCount(11)).toBe(12)
    })

    it('clamps above-max values down to 24', () => {
      expect(clampFretCount(25)).toBe(24)
      expect(clampFretCount(100)).toBe(24)
    })

    it('rounds non-integer values to the nearest integer before clamping', () => {
      expect(clampFretCount(15.4)).toBe(15)
      expect(clampFretCount(15.6)).toBe(16)
    })

    it('returns the minimum for non-finite inputs', () => {
      expect(clampFretCount(Number.NaN)).toBe(12)
      expect(clampFretCount(Number.POSITIVE_INFINITY)).toBe(12)
      expect(clampFretCount(Number.NEGATIVE_INFINITY)).toBe(12)
    })
  })
})
