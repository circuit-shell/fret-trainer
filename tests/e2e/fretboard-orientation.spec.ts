import { test, expect } from '@playwright/test'

test.describe('US1 — fretboard orientation (string 1 at top, string 6 at bottom)', () => {
  test('open-string reference markers read E, B, G, D, A, E top-to-bottom', async ({ page }) => {
    await page.goto('/')
    // Open-string labels are now reference markers rendered inside each fret-0
    // cell (one per string). Reading them top-to-bottom under the US1 orientation
    // gives E (string 1, high E), B, G, D, A, E (string 6, low E).
    const expected: Array<[number, string]> = [
      [1, 'E'],
      [2, 'B'],
      [3, 'G'],
      [4, 'D'],
      [5, 'A'],
      [6, 'E'],
    ]
    for (const [str, note] of expected) {
      const label = page.getByTestId(`reference-marker-${str}-0-label`)
      await expect(label).toHaveText(note)
    }
  })

  test('the bottommost row is string 6 (low E); the topmost row is string 1 (high E)', async ({
    page,
  }) => {
    await page.goto('/')
    const buttons = page.getByRole('grid', { name: /fretboard/i }).getByRole('button')
    const count = await buttons.count()
    const first = buttons.nth(0)
    const last = buttons.nth(count - 1)
    await expect(first).toHaveAttribute('aria-label', /String 1\b/)
    await expect(last).toHaveAttribute('aria-label', /String 6\b/)
  })

  test('tapping fret 5 of the bottommost row resolves to A (the Ted Greene anchor on string 6)', async ({
    page,
  }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'A', exact: true }).click()
    const cell = page.getByRole('button', { name: /String 6.*fret 5\b/i })
    await cell.click()
    await expect(cell).toHaveAttribute('data-attempt', 'correct')
  })
})
