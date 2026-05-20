import { test, expect } from '@playwright/test'

test.describe('US3 — clearer fret-wire dividers', () => {
  test('every cell has a divider data attribute that classifies it as nut/wire/none', async ({
    page,
  }) => {
    await page.goto('/')
    const fret0 = page.getByRole('button', { name: /String 1.*fret 0\b/i })
    const fret1 = page.getByRole('button', { name: /String 1.*fret 1\b/i })
    const fret5 = page.getByRole('button', { name: /String 1.*fret 5\b/i })
    await expect(fret0).toHaveAttribute('data-divider', 'none')
    await expect(fret1).toHaveAttribute('data-divider', 'nut')
    await expect(fret5).toHaveAttribute('data-divider', 'wire')
  })

  test('the nut (fret 1 left border) is visibly heavier than a normal fret wire', async ({
    page,
  }) => {
    await page.goto('/')
    const fret1 = page.getByRole('button', { name: /String 1.*fret 1\b/i })
    const fret5 = page.getByRole('button', { name: /String 1.*fret 5\b/i })

    const nutWidth = await fret1.evaluate(
      (el) => parseFloat(getComputedStyle(el).borderLeftWidth) || 0,
    )
    const wireWidth = await fret5.evaluate(
      (el) => parseFloat(getComputedStyle(el).borderLeftWidth) || 0,
    )
    expect(nutWidth).toBeGreaterThan(wireWidth)
    expect(wireWidth).toBeGreaterThan(0)
  })
})
