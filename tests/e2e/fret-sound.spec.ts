import { test, expect, type Page } from '@playwright/test'

declare global {
  interface Window {
    __audioEngine?: {
      isReady: () => boolean
      isUnavailable: () => boolean
      playCount: number
    }
  }
}

const SETTINGS_KEY = 'fretboard-trainer.settings.v1'

const SOUND_ON_BLOB = JSON.stringify({
  showReferenceMarkers: true,
  referenceNamesVisible: true,
  pianoLabelsVisible: true,
  blackKeyLabelsVisible: true,
  inlayDotsVisible: true,
  fretNumbersTopVisible: false,
  fretNumbersBottomVisible: false,
  notation: 'letters',
  fretCount: 12,
  soundEnabled: true,
})

const SOUND_OFF_BLOB = JSON.stringify({
  showReferenceMarkers: true,
  referenceNamesVisible: true,
  pianoLabelsVisible: true,
  blackKeyLabelsVisible: true,
  inlayDotsVisible: true,
  fretNumbersTopVisible: false,
  fretNumbersBottomVisible: false,
  notation: 'letters',
  fretCount: 12,
  soundEnabled: false,
})

async function primeSettings(page: Page, blob: string): Promise<void> {
  await page.addInitScript(
    ({ key, value }) => {
      window.localStorage.setItem(key, value)
    },
    { key: SETTINGS_KEY, value: blob },
  )
}

test.describe('US2 — fretboard sound', () => {
  test('with sound on, tapping any fret triggers the engine (FR-002)', async ({ page }) => {
    await primeSettings(page, SOUND_ON_BLOB)
    await page.goto('/')

    // Tap low-E string (string 6) fret 3 → G2.
    await page.getByRole('button', { name: /String 6.*fret 3\b/i }).click()

    const count = await page.evaluate(() => window.__audioEngine?.playCount ?? -1)
    expect(count).toBeGreaterThanOrEqual(1)

    await expect
      .poll(async () => page.evaluate(() => window.__audioEngine?.isReady() ?? false), {
        timeout: 5000,
      })
      .toBe(true)
  })

  test('with sound off, tapping a fret does NOT trigger audio (FR-003, R14 bundle invariant)', async ({
    page,
  }) => {
    await primeSettings(page, SOUND_OFF_BLOB)
    await page.goto('/')

    await page.getByRole('button', { name: /String 6.*fret 3\b/i }).click()

    const count = await page.evaluate(() => window.__audioEngine?.playCount ?? 0)
    expect(count).toBe(0)
  })
})
