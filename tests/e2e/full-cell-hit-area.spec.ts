import { test, expect } from '@playwright/test'

test.describe('US4 — entire fret cell is clickable', () => {
  test('clicks at left edge, center, and right edge of the same cell all register', async ({
    page,
  }) => {
    await page.goto('/')

    // Pick C as the target.
    await page.getByRole('button', { name: 'C', exact: true }).click()

    // Use a non-target cell so the result is "incorrect" — that's enough to prove the
    // click was registered against the intended (string, fret).
    // String 4 fret 7 → A (D + 7 = 9), not C.
    const cell = page.getByRole('button', { name: /String 4.*fret 7\b/i })
    const box = await cell.boundingBox()
    expect(box).not.toBeNull()
    if (!box) return

    // Left edge (2 px inside the left border).
    await cell.click({ position: { x: 2, y: box.height / 2 } })
    await expect(cell).toHaveAttribute('data-attempt', 'incorrect')

    // Reset the round on the same note to clear the marker.
    await page.getByRole('button', { name: 'C', exact: true }).click()
    await expect(cell).not.toHaveAttribute('data-attempt', 'incorrect')

    // Center.
    await cell.click({ position: { x: box.width / 2, y: box.height / 2 } })
    await expect(cell).toHaveAttribute('data-attempt', 'incorrect')

    // Reset.
    await page.getByRole('button', { name: 'C', exact: true }).click()
    await expect(cell).not.toHaveAttribute('data-attempt', 'incorrect')

    // Right edge (2 px from the right edge).
    await cell.click({ position: { x: box.width - 2, y: box.height / 2 } })
    await expect(cell).toHaveAttribute('data-attempt', 'incorrect')
  })

  test('mobile tap targets remain ≥ 44×44 px after the refactor', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'mobile-only check')
    await page.goto('/')
    const cell = page.getByRole('button', { name: /String 4.*fret 5\b/i })
    const box = await cell.boundingBox()
    expect(box).not.toBeNull()
    expect(box!.width).toBeGreaterThanOrEqual(44)
    expect(box!.height).toBeGreaterThanOrEqual(44)
  })
})
