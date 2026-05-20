import { test, expect } from '@playwright/test'

test.describe('US2 — piano replaces the chromatic picker', () => {
  test('the piano-picker group is visible with 12 keys', async ({ page }) => {
    await page.goto('/')
    const piano = page.getByRole('group', { name: /piano picker/i })
    await expect(piano).toBeVisible()
    await expect(piano.getByRole('button')).toHaveCount(12)
  })

  test('the legacy 12-button chromatic group is gone', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('group', { name: /note picker/i })).toHaveCount(0)
  })

  test('tapping a white key sets that note as the target', async ({ page }) => {
    await page.goto('/')
    const piano = page.getByRole('group', { name: /piano picker/i })
    await piano.getByRole('button', { name: 'C', exact: true }).click()
    await expect(
      page.getByRole('button', { name: /re-roll random note .*current: C/i }),
    ).toBeVisible()
  })

  test('tapping a black key sets the sharp note as the target', async ({ page }) => {
    await page.goto('/')
    const piano = page.getByRole('group', { name: /piano picker/i })
    await piano.getByRole('button', { name: 'F sharp / G flat' }).click()
    await expect(
      page.getByRole('button', { name: /re-roll random note .*current: F#/i }),
    ).toBeVisible()
  })

  test('selecting a key clears prior green/red attempt markers', async ({ page }) => {
    await page.goto('/')
    const piano = page.getByRole('group', { name: /piano picker/i })
    await piano.getByRole('button', { name: 'C', exact: true }).click()
    const wrongCell = page.getByRole('button', { name: /String 6.*fret 1\b/i })
    await wrongCell.click()
    await expect(wrongCell).toHaveAttribute('data-attempt', 'incorrect')
    // Switch to a different note via a black key — round should reset.
    await piano.getByRole('button', { name: 'F sharp / G flat' }).click()
    await expect(wrongCell).not.toHaveAttribute('data-attempt', 'incorrect')
  })

  test('the target-note display width does not change when picking different notes', async ({
    page,
  }) => {
    await page.goto('/')
    const piano = page.getByRole('group', { name: /piano picker/i })

    // Helper: the target-note button's width across the practice stage.
    const targetWidth = async (): Promise<number> => {
      const box = await page
        .getByRole('button', { name: /(pick a random note|re-roll random note)/i })
        .boundingBox()
      expect(box).not.toBeNull()
      return box!.width
    }

    // Baseline: placeholder treble clef.
    const baseline = await targetWidth()

    // Pick a 1-character white note.
    await piano.getByRole('button', { name: 'C', exact: true }).click()
    expect(await targetWidth()).toBe(baseline)

    // Pick a 2-character black note — width must still match.
    await piano.getByRole('button', { name: 'F sharp / G flat' }).click()
    expect(await targetWidth()).toBe(baseline)

    // Pick another black note (different sharp).
    await piano.getByRole('button', { name: 'G sharp / A flat' }).click()
    expect(await targetWidth()).toBe(baseline)

    // Back to a white note.
    await piano.getByRole('button', { name: 'B', exact: true }).click()
    expect(await targetWidth()).toBe(baseline)
  })

  test('exactly one piano key is aria-pressed at a time', async ({ page }) => {
    await page.goto('/')
    const piano = page.getByRole('group', { name: /piano picker/i })
    await expect(piano.getByRole('button', { pressed: true })).toHaveCount(0)
    await piano.getByRole('button', { name: 'G', exact: true }).click()
    await expect(piano.getByRole('button', { pressed: true })).toHaveCount(1)
    await piano.getByRole('button', { name: 'G sharp / A flat' }).click()
    await expect(piano.getByRole('button', { pressed: true })).toHaveCount(1)
  })

  test('on mobile, every white piano key meets the 44×44 px tap-target minimum', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'mobile-only check')
    await page.goto('/')
    const piano = page.getByRole('group', { name: /piano picker/i })
    const whiteKeys = piano.locator('[data-variant="white"]')
    const count = await whiteKeys.count()
    expect(count).toBe(7)
    for (let i = 0; i < count; i++) {
      const box = await whiteKeys.nth(i).boundingBox()
      expect(box, `white key #${i}`).not.toBeNull()
      if (!box) continue
      expect(box.width, `white key #${i} width`).toBeGreaterThanOrEqual(44)
      expect(box.height, `white key #${i} height`).toBeGreaterThanOrEqual(44)
    }
  })

  test('on mobile, every black piano key has a usable tap target (visible width and tall hit area)', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'mobile-only check')
    await page.goto('/')
    const piano = page.getByRole('group', { name: /piano picker/i })
    const blackKeys = piano.locator('[data-variant="black"]')
    const count = await blackKeys.count()
    expect(count).toBe(5)
    for (let i = 0; i < count; i++) {
      const box = await blackKeys.nth(i).boundingBox()
      expect(box, `black key #${i}`).not.toBeNull()
      if (!box) continue
      // Black keys are visually narrower than white keys (real piano geometry).
      // Enforce a reasonable lower bound that still permits one-finger taps.
      expect(box.width, `black key #${i} width`).toBeGreaterThanOrEqual(24)
      expect(box.height, `black key #${i} height`).toBeGreaterThanOrEqual(60)
    }
  })

  test('the piano fits without horizontal scroll on the mobile viewport', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'mobile-only check')
    await page.goto('/')
    const piano = page.getByRole('group', { name: /piano picker/i })
    const box = await piano.boundingBox()
    expect(box).not.toBeNull()
    if (!box) return
    const viewport = page.viewportSize()
    expect(viewport).not.toBeNull()
    if (!viewport) return
    expect(box.x).toBeGreaterThanOrEqual(0)
    expect(box.x + box.width).toBeLessThanOrEqual(viewport.width + 1)
  })
})
