import { test, expect } from '@playwright/test'
import { openSettings } from './helpers'

test.describe('US3 — toggleable reference notes', () => {
  test('reference markers visible by default, hide on toggle, reappear on toggle', async ({
    page,
  }) => {
    await page.goto('/')

    // The 5 canonical markers should be in the DOM initially.
    await expect(page.getByTestId('reference-marker-6-5')).toBeVisible()
    await expect(page.getByTestId('reference-marker-5-5')).toBeVisible()
    await expect(page.getByTestId('reference-marker-4-5')).toBeVisible()
    await expect(page.getByTestId('reference-marker-3-4')).toBeVisible()
    await expect(page.getByTestId('reference-marker-2-5')).toBeVisible()

    await openSettings(page)
    const toggleLabel = page.locator('label').filter({ hasText: /show reference notes/i })
    const toggle = toggleLabel.getByRole('checkbox')
    await expect(toggle).toBeChecked()

    // Toggle off → markers disappear.
    await toggleLabel.click()
    await expect(toggle).not.toBeChecked()
    await expect(page.getByTestId('reference-marker-6-5')).toHaveCount(0)
    await expect(page.getByTestId('reference-marker-2-5')).toHaveCount(0)

    // Toggle on → markers reappear.
    await toggleLabel.click()
    await expect(toggle).toBeChecked()
    await expect(page.getByTestId('reference-marker-6-5')).toBeVisible()
  })

  test('round green/red marks survive a reference-toggle off', async ({ page }) => {
    await page.goto('/')

    // Pick C and tap the A position on string 6 — that's INCORRECT (A != C).
    const piano = page.getByRole('group', { name: /piano picker/i })
    await piano.getByRole('button', { name: 'C', exact: true }).click()
    const cell = page.getByRole('button', { name: /String 6.*fret 5\b/i })
    await cell.click()
    await expect(cell).toHaveAttribute('data-attempt', 'incorrect')

    // Toggle reference off via the settings drawer.
    await openSettings(page)
    await page.locator('label').filter({ hasText: /show reference notes/i }).click()
    await expect(page.getByTestId('reference-marker-6-5')).toHaveCount(0)
    // The user's red marker on string 6 fret 5 should still be there.
    await expect(cell).toHaveAttribute('data-attempt', 'incorrect')
  })
})
