import { test, expect } from '@playwright/test'

test.describe('US1 — random-on-display + treble-clef placeholder', () => {
  test('treble clef is shown on load; the standalone Random button is gone from the picker', async ({
    page,
  }) => {
    await page.goto('/')
    await expect(page.getByRole('img', { name: /treble clef/i })).toBeVisible()
    // The picker should NOT contain a "Random" button — that button has moved into the
    // target-note display itself. (We scope the check to the picker; the
    // target-note display button has its own "pick a random note" aria-label, which
    // is intentional, not a regression.)
    const picker = page.getByRole('group', { name: /note picker/i })
    await expect(picker.getByRole('button', { name: /^random$/i })).toHaveCount(0)
    await expect(picker.getByRole('button', { name: /🎲/ })).toHaveCount(0)
  })

  test('tapping the display picks a random note and replaces the clef', async ({ page }) => {
    await page.goto('/')
    const displayButton = page.getByRole('button', { name: /pick a random note/i })
    await expect(displayButton).toBeVisible()
    await displayButton.click()
    // After clicking, the display now shows a note label; the aria-label switches.
    await expect(page.getByRole('img', { name: /treble clef/i })).toHaveCount(0)
    await expect(page.getByRole('button', { name: /^re-roll random note/i })).toBeVisible()
  })

  test('tapping again produces a different note (no-repeat rule)', async ({ page }) => {
    await page.goto('/')
    const displayButton = () => page.getByRole('button', { name: /random note/i })
    await displayButton().click()
    const firstLabel = (await displayButton().getAttribute('aria-label')) ?? ''
    await displayButton().click()
    const secondLabel = (await displayButton().getAttribute('aria-label')) ?? ''
    // Both contain "current: <note>"; the note must differ.
    const first = firstLabel.match(/current:\s*([A-G]#?)/i)?.[1] ?? ''
    const second = secondLabel.match(/current:\s*([A-G]#?)/i)?.[1] ?? ''
    expect(first).not.toBe('')
    expect(second).not.toBe('')
    expect(second).not.toBe(first)
  })

  test('the target-note display does not shift height between the placeholder and a note', async ({
    page,
  }) => {
    await page.goto('/')
    const placeholderButton = page.getByRole('button', { name: /pick a random note/i })
    const placeholderBox = await placeholderButton.boundingBox()
    expect(placeholderBox).not.toBeNull()
    if (!placeholderBox) return

    await placeholderButton.click()

    const noteButton = page.getByRole('button', { name: /re-roll random note/i })
    const noteBox = await noteButton.boundingBox()
    expect(noteBox).not.toBeNull()
    if (!noteBox) return

    // Both states must occupy the same vertical space so the page doesn't
    // jump when the user taps the placeholder.
    expect(Math.abs(noteBox.height - placeholderBox.height)).toBeLessThan(2)
    expect(Math.abs(noteBox.y - placeholderBox.y)).toBeLessThan(2)
  })

  test('re-rolling mid-round clears the green/red attempt markers', async ({ page }) => {
    await page.goto('/')
    // Pick C from the (still-present) chromatic picker so we have a deterministic target.
    await page.getByRole('button', { name: 'C', exact: true }).click()
    // Tap a wrong cell on string 6.
    const wrongCell = page.getByRole('button', { name: /String 6.*fret 1\b/i })
    await wrongCell.click()
    await expect(wrongCell).toHaveAttribute('data-attempt', 'incorrect')
    // Re-roll via the target-note display.
    await page.getByRole('button', { name: /random note/i }).click()
    await expect(wrongCell).not.toHaveAttribute('data-attempt', 'incorrect')
  })
})
