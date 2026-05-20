import { test, expect, type Page } from '@playwright/test'

// The audio engine attaches itself to window.__audioEngine in non-production
// builds (see src/domain/audio.ts test seam). These E2E specs assert behavior
// through that seam — they NEVER depend on a `window.Tone` global because
// Tone.js does not auto-attach itself under ES-module import.
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

async function readPlayCount(page: Page): Promise<number> {
  return await page.evaluate(() => window.__audioEngine?.playCount ?? -1)
}

test.describe('US1 — piano-key sound', () => {
  test('with sound on, tapping a piano key triggers the engine (FR-001)', async ({ page }) => {
    await primeSettings(page, SOUND_ON_BLOB)
    await page.goto('/')

    // Tap a white key. The handler synchronously bumps playCount and starts
    // engine loading; we then wait for isReady() to flip true.
    const piano = page.getByRole('group', { name: /piano picker/i })
    await piano.getByRole('button', { name: 'C', exact: true }).click()

    expect(await readPlayCount(page)).toBeGreaterThanOrEqual(1)

    await expect
      .poll(async () => page.evaluate(() => window.__audioEngine?.isReady() ?? false), {
        timeout: 5000,
      })
      .toBe(true)
  })

  test('rolling a random note plays the rolled pitch as a piano sample (the FR-010 silence has been deliberately reversed)', async ({
    page,
  }) => {
    await primeSettings(page, SOUND_ON_BLOB)
    await page.goto('/')

    // Tap the target-note display to roll a random note. The roll itself is
    // sync; the audio engine activates in the same gesture.
    const reroll = page.getByRole('button', { name: /pick a random note|re-roll random note/i })
    await reroll.click()

    // The play counter must have ticked at least once (the rolled note played
    // through the piano sampler). With sound disabled this would stay at 0;
    // see the sound-off pass below.
    await expect
      .poll(async () => page.evaluate(() => window.__audioEngine?.playCount ?? 0), {
        timeout: 5000,
      })
      .toBeGreaterThanOrEqual(1)
  })

  test('with sound off, tapping a piano key does NOT trigger audio (FR-003)', async ({
    page,
  }) => {
    await primeSettings(page, SOUND_OFF_BLOB)
    await page.goto('/')

    const piano = page.getByRole('group', { name: /piano picker/i })
    await piano.getByRole('button', { name: 'C', exact: true }).click()

    // The hook returns no-op callbacks, so the engine's play* is never called
    // and the engine module's lazy import never even runs. playCount stays at
    // its initial 0 (or window.__audioEngine is absent if the module never
    // loaded in this session — both outcomes are correct).
    const count = await page.evaluate(() => window.__audioEngine?.playCount ?? 0)
    expect(count).toBe(0)
  })
})
