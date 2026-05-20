import { test, expect } from '@playwright/test'
import { openSettings, closeSettings } from './helpers'

declare global {
  interface Window {
    __audioEngine?: {
      isReady: () => boolean
      isUnavailable: () => boolean
      playCount: number
    }
  }
}

test.describe('US3 — Sound toggle in settings drawer', () => {
  test('toggle is present in settings, defaults to off, enables audio when flipped on', async ({
    page,
  }) => {
    await page.goto('/')

    // Open settings; assert the Sound toggle exists and defaults to off.
    await openSettings(page)
    const soundSwitch = page.getByRole('switch', { name: /sound/i })
    await expect(soundSwitch).toBeVisible()
    await expect(soundSwitch).toHaveAttribute('aria-checked', 'false')

    // Flip it on by clicking the visible label (input is sr-only — same
    // pattern the other toggles use).
    await page.getByText(/^sound$/i).click()
    await expect(soundSwitch).toHaveAttribute('aria-checked', 'true')

    await closeSettings(page)

    // Tap a piano key; audio engine should activate.
    const piano = page.getByRole('group', { name: /piano picker/i })
    await piano.getByRole('button', { name: 'C', exact: true }).click()

    await expect
      .poll(async () => page.evaluate(() => window.__audioEngine?.isReady() ?? false), {
        timeout: 5000,
      })
      .toBe(true)
  })

  test('toggle state persists across reload (FR-005)', async ({ page }) => {
    await page.goto('/')

    await openSettings(page)
    await page.getByText(/^sound$/i).click()
    await expect(page.getByRole('switch', { name: /sound/i })).toHaveAttribute(
      'aria-checked',
      'true',
    )
    await closeSettings(page)

    // Reload the page; the toggle should still be on.
    await page.reload()
    await openSettings(page)
    await expect(page.getByRole('switch', { name: /sound/i })).toHaveAttribute(
      'aria-checked',
      'true',
    )

    // Now turn it off and reload; verify it stays off (full round-trip).
    await page.getByText(/^sound$/i).click()
    await expect(page.getByRole('switch', { name: /sound/i })).toHaveAttribute(
      'aria-checked',
      'false',
    )
    await closeSettings(page)

    await page.reload()
    await openSettings(page)
    await expect(page.getByRole('switch', { name: /sound/i })).toHaveAttribute(
      'aria-checked',
      'false',
    )
  })

  test('Reset to defaults restores Sound to off (FR-006)', async ({ page }) => {
    await page.goto('/')

    await openSettings(page)
    await page.getByText(/^sound$/i).click()
    await expect(page.getByRole('switch', { name: /sound/i })).toHaveAttribute(
      'aria-checked',
      'true',
    )

    // Click "Reset to defaults" at the bottom of the drawer.
    await page.getByRole('button', { name: /reset to defaults/i }).click()
    await expect(page.getByRole('switch', { name: /sound/i })).toHaveAttribute(
      'aria-checked',
      'false',
    )
  })
})
