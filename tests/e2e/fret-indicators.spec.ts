import { test, expect } from '@playwright/test'
import { openSettings } from './helpers'

function findToggle(page: import('@playwright/test').Page, labelText: RegExp) {
  const label = page.locator('label').filter({ hasText: labelText })
  return { label, input: label.getByRole('checkbox') }
}

test.describe('fret indicators — inlay dots and top/bottom fret numbers', () => {
  test('defaults: dots ON, both fret-number toggles OFF', async ({ page }) => {
    await page.goto('/')
    await openSettings(page)

    const dots = findToggle(page, /show inlay dots/i)
    const top = findToggle(page, /fret numbers on top/i)
    const bottom = findToggle(page, /fret numbers on bottom/i)

    await expect(dots.input).toBeChecked()
    await expect(top.input).not.toBeChecked()
    await expect(bottom.input).not.toBeChecked()

    await expect(page.getByTestId('inlay-dot-3')).toBeVisible()
    await expect(page.getByTestId('inlay-dot-12')).toBeVisible()
    await expect(page.locator('[data-fret-number="0"]')).toHaveCount(0)
  })

  test('inlay-dots toggle works independently of the fret-number toggles', async ({ page }) => {
    await page.goto('/')
    await openSettings(page)
    const dots = findToggle(page, /show inlay dots/i)
    await dots.label.click()
    await expect(dots.input).not.toBeChecked()
    await expect(page.getByTestId('inlay-dot-3')).toHaveCount(0)
    await dots.label.click()
    await expect(page.getByTestId('inlay-dot-3')).toBeVisible()
  })

  test('the open-string column (fret 0) is not labeled with "0" in the number bar', async ({
    page,
  }) => {
    await page.goto('/')
    await openSettings(page)
    await findToggle(page, /fret numbers on top/i).label.click()
    const fret0 = page.locator('[data-testid="fret-indicator-bar"] [data-fret-number="0"]').first()
    await expect(fret0).toHaveText('')
    await expect(
      page.locator('[data-testid="fret-indicator-bar"] [data-fret-number="5"]').first(),
    ).toHaveText('5')
  })

  test('top fret-numbers toggle renders the bar above the playing grid', async ({ page }) => {
    await page.goto('/')
    await openSettings(page)
    const top = findToggle(page, /fret numbers on top/i)
    const bottom = findToggle(page, /fret numbers on bottom/i)

    await top.label.click()
    await expect(top.input).toBeChecked()

    const bar = page.locator('[data-testid="fret-indicator-bar"][data-position="top"]')
    await expect(bar).toBeVisible()
    // The open-string column (fret 0) renders an empty placeholder — its
    // intrinsic height collapses, so Playwright cannot toBeVisible it.
    // Check a labeled fret instead.
    await expect(bar.locator('[data-fret-number="5"]')).toBeVisible()
    await expect(bar.locator('[data-fret-number="12"]')).toBeVisible()

    // Top bar's vertical position is above the playing grid.
    const barBox = await bar.boundingBox()
    const gridBox = await page.getByRole('grid', { name: /fretboard/i }).boundingBox()
    expect(barBox).not.toBeNull()
    expect(gridBox).not.toBeNull()
    if (!barBox || !gridBox) return
    expect(barBox.y + barBox.height).toBeLessThanOrEqual(gridBox.y + 1)

    // Bottom toggle is still off.
    await expect(bottom.input).not.toBeChecked()
  })

  test('bottom fret-numbers toggle renders the bar below the playing grid', async ({ page }) => {
    await page.goto('/')
    await openSettings(page)
    const bottom = findToggle(page, /fret numbers on bottom/i)
    await bottom.label.click()
    await expect(bottom.input).toBeChecked()

    const bar = page.locator('[data-testid="fret-indicator-bar"][data-position="bottom"]')
    await expect(bar).toBeVisible()
    await expect(bar.locator('[data-fret-number="5"]')).toBeVisible()

    const barBox = await bar.boundingBox()
    const gridBox = await page.getByRole('grid', { name: /fretboard/i }).boundingBox()
    expect(barBox).not.toBeNull()
    expect(gridBox).not.toBeNull()
    if (!barBox || !gridBox) return
    expect(barBox.y).toBeGreaterThanOrEqual(gridBox.y + gridBox.height - 1)
  })

  test('both top and bottom number bars can be on at once', async ({ page }) => {
    await page.goto('/')
    await openSettings(page)
    await findToggle(page, /fret numbers on top/i).label.click()
    await findToggle(page, /fret numbers on bottom/i).label.click()
    await expect(
      page.locator('[data-testid="fret-indicator-bar"][data-position="top"]'),
    ).toBeVisible()
    await expect(
      page.locator('[data-testid="fret-indicator-bar"][data-position="bottom"]'),
    ).toBeVisible()
  })

  test('toggling fret numbers does NOT shift the playing-grid position (slot heights stay constant)', async ({
    page,
  }) => {
    // The no-layout-shift contract: the top/bottom number-bar slots reserve a
    // fixed height whether or not their bar is visible inside, so the playing
    // grid never moves vertically when a toggle flips. Compare the slot height
    // in every combination of toggle states.
    await page.goto('/')
    await openSettings(page)
    const topSlot = page.getByTestId('fret-numbers-top-slot')
    const bottomSlot = page.getByTestId('fret-numbers-bottom-slot')
    const top = findToggle(page, /fret numbers on top/i)
    const bottom = findToggle(page, /fret numbers on bottom/i)

    const slotHeight = async (slot: typeof topSlot): Promise<number> => {
      const box = await slot.boundingBox()
      expect(box).not.toBeNull()
      return box!.height
    }

    // Baseline: both off.
    const topHeightOff = await slotHeight(topSlot)
    const bottomHeightOff = await slotHeight(bottomSlot)

    // Top on → top slot height unchanged.
    await top.label.click()
    expect(await slotHeight(topSlot)).toBe(topHeightOff)
    expect(await slotHeight(bottomSlot)).toBe(bottomHeightOff)

    // Bottom on → both slot heights still unchanged.
    await bottom.label.click()
    expect(await slotHeight(topSlot)).toBe(topHeightOff)
    expect(await slotHeight(bottomSlot)).toBe(bottomHeightOff)

    // Top off → top still constant.
    await top.label.click()
    expect(await slotHeight(topSlot)).toBe(topHeightOff)
    expect(await slotHeight(bottomSlot)).toBe(bottomHeightOff)

    // Bottom off → both back to baseline (unchanged the whole time).
    await bottom.label.click()
    expect(await slotHeight(topSlot)).toBe(topHeightOff)
    expect(await slotHeight(bottomSlot)).toBe(bottomHeightOff)
  })

  test('toggling indicators does not clear green/red marks on the playing rows', async ({
    page,
  }) => {
    await page.goto('/')
    const piano = page.getByRole('group', { name: /piano picker/i })
    await piano.getByRole('button', { name: 'C', exact: true }).click()

    const cell = page.getByRole('button', { name: /String 6.*fret 5\b/i })
    await cell.click()
    await expect(cell).toHaveAttribute('data-attempt', 'incorrect')

    await openSettings(page)
    const dots = findToggle(page, /show inlay dots/i)
    const top = findToggle(page, /fret numbers on top/i)
    const bottom = findToggle(page, /fret numbers on bottom/i)

    await top.label.click()
    await expect(cell).toHaveAttribute('data-attempt', 'incorrect')
    await bottom.label.click()
    await expect(cell).toHaveAttribute('data-attempt', 'incorrect')
    await dots.label.click()
    await expect(cell).toHaveAttribute('data-attempt', 'incorrect')
  })

  test('inlay dots are horizontally aligned with their playing-grid columns', async ({
    page,
  }) => {
    await page.goto('/')
    for (const fret of [3, 5, 7, 9, 12]) {
      const dotBox = await page.getByTestId(`inlay-dot-${fret}`).boundingBox()
      const cellBox = await page
        .getByRole('button', { name: new RegExp(`String 1.*fret ${fret}\\b`, 'i') })
        .boundingBox()
      expect(dotBox, `dot for fret ${fret}`).not.toBeNull()
      expect(cellBox, `cell for fret ${fret}`).not.toBeNull()
      if (!dotBox || !cellBox) continue
      const dotCenter = dotBox.x + dotBox.width / 2
      const cellCenter = cellBox.x + cellBox.width / 2
      expect(Math.abs(dotCenter - cellCenter)).toBeLessThan(2)
    }
  })

  test('single inlay dots sit in the vertical center of the fretboard (between strings 3 and 4)', async ({
    page,
  }) => {
    await page.goto('/')
    for (const fret of [3, 5, 7]) {
      const dotBox = await page.getByTestId(`inlay-dot-${fret}`).boundingBox()
      const s3 = await page
        .getByRole('button', { name: new RegExp(`String 3.*fret ${fret}\\b`, 'i') })
        .boundingBox()
      const s4 = await page
        .getByRole('button', { name: new RegExp(`String 4.*fret ${fret}\\b`, 'i') })
        .boundingBox()
      expect(dotBox, `dot for fret ${fret}`).not.toBeNull()
      expect(s3, `string 3 cell for fret ${fret}`).not.toBeNull()
      expect(s4, `string 4 cell for fret ${fret}`).not.toBeNull()
      if (!dotBox || !s3 || !s4) continue
      const dotCenterY = dotBox.y + dotBox.height / 2
      const boundaryY = (s3.y + s3.height + s4.y) / 2
      expect(Math.abs(dotCenterY - boundaryY)).toBeLessThan(4)
    }
  })

  test('double inlay dot at fret 12 renders two stacked dots', async ({ page }) => {
    await page.goto('/')
    const wrapper = page.getByTestId('inlay-dot-12')
    await expect(wrapper).toHaveAttribute('data-kind', 'double')
    await expect(wrapper.locator('> span')).toHaveCount(2)
  })

  test('top fret-number labels align horizontally with their playing-grid columns', async ({
    page,
  }) => {
    await page.goto('/')
    await openSettings(page)
    await findToggle(page, /fret numbers on top/i).label.click()

    const bar = page.locator('[data-testid="fret-indicator-bar"][data-position="top"]')
    for (const fret of [0, 1, 3, 7, 12]) {
      const numberBox = await bar.locator(`[data-fret-number="${fret}"]`).boundingBox()
      const cellBox = await page
        .getByRole('button', { name: new RegExp(`String 1.*fret ${fret}\\b`, 'i') })
        .boundingBox()
      expect(numberBox, `number for fret ${fret}`).not.toBeNull()
      expect(cellBox, `cell for fret ${fret}`).not.toBeNull()
      if (!numberBox || !cellBox) continue
      const numberCenter = numberBox.x + numberBox.width / 2
      const cellCenter = cellBox.x + cellBox.width / 2
      expect(Math.abs(numberCenter - cellCenter)).toBeLessThan(2)
    }
  })
})
