import { test, expect } from '@playwright/test'
import { openSettings } from './helpers'

test.describe('fret-count control + responsive tap targets', () => {
  test('defaults to 12 frets (13 columns × 6 strings = 78 cells) on every viewport', async ({
    page,
  }) => {
    await page.goto('/')
    const cells = page.getByRole('grid', { name: /fretboard/i }).getByRole('button')
    await expect(cells).toHaveCount(78)
  })

  test('the fret-count slider lets the user expand the board up to 24 frets', async ({
    page,
  }) => {
    await page.goto('/')
    await openSettings(page)
    const slider = page.getByRole('slider', { name: /number of frets shown/i })
    await expect(slider).toHaveAttribute('min', '12')
    await expect(slider).toHaveAttribute('max', '24')

    await slider.fill('24')
    await expect(slider).toHaveValue('24')

    const cells = page.getByRole('grid', { name: /fretboard/i }).getByRole('button')
    // 6 strings × (24 + 1) = 150
    await expect(cells).toHaveCount(150)
  })

  test('the fret-count slider can be dialed back down to 12', async ({ page }) => {
    await page.goto('/')
    await openSettings(page)
    const slider = page.getByRole('slider', { name: /number of frets shown/i })
    await slider.fill('20')
    let cells = page.getByRole('grid', { name: /fretboard/i }).getByRole('button')
    await expect(cells).toHaveCount(126) // 6 × 21
    await slider.fill('12')
    cells = page.getByRole('grid', { name: /fretboard/i }).getByRole('button')
    await expect(cells).toHaveCount(78)
  })

  test('mobile tap targets are at least 44×44 px at the default fret count', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'mobile-only check')
    await page.goto('/')
    const sample = page.getByRole('button', { name: /String 6.*fret 5\b/i })
    const box = await sample.boundingBox()
    expect(box).not.toBeNull()
    expect(box!.height).toBeGreaterThanOrEqual(44)
    expect(box!.width).toBeGreaterThanOrEqual(44)
  })
})
