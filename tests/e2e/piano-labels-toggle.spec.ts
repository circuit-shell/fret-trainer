import { test, expect } from '@playwright/test'
import { openSettings } from './helpers'

function findToggle(page: import('@playwright/test').Page, labelText: RegExp) {
  const label = page.locator('label').filter({ hasText: labelText })
  return { label, input: label.getByRole('checkbox') }
}

test.describe('piano labels — independent white-key and black-key toggles', () => {
  test('both toggles default to ON; white letters and black sharp/flat pairs are visible', async ({
    page,
  }) => {
    await page.goto('/')
    const piano = page.getByRole('group', { name: /piano picker/i })

    await openSettings(page)
    const whiteToggle = findToggle(page, /^show piano labels$/i)
    const blackToggle = findToggle(page, /^show black-key labels$/i)
    await expect(whiteToggle.input).toBeChecked()
    await expect(blackToggle.input).toBeChecked()

    const cKey = piano.getByRole('button', { name: 'C', exact: true })
    await expect(cKey).toContainText('C')
    const csKey = piano.getByRole('button', { name: 'C sharp / D flat' })
    await expect(csKey).toContainText('C#')
    await expect(csKey).toContainText('Db')
  })

  test('white-key labels toggle hides only the white-key letters', async ({ page }) => {
    await page.goto('/')
    const piano = page.getByRole('group', { name: /piano picker/i })

    await openSettings(page)
    const whiteToggle = findToggle(page, /^show piano labels$/i)
    await whiteToggle.label.click()
    await expect(whiteToggle.input).not.toBeChecked()

    for (const name of ['C', 'D', 'E', 'F', 'G', 'A', 'B']) {
      const btn = piano.getByRole('button', { name, exact: true })
      await expect(btn).toHaveText('')
    }
    const csKey = piano.getByRole('button', { name: 'C sharp / D flat' })
    await expect(csKey).toContainText('C#')
    await expect(csKey).toContainText('Db')
  })

  test('black-key labels toggle hides only the sharp/flat labels', async ({ page }) => {
    await page.goto('/')
    const piano = page.getByRole('group', { name: /piano picker/i })

    await openSettings(page)
    const blackToggle = findToggle(page, /^show black-key labels$/i)
    await blackToggle.label.click()
    await expect(blackToggle.input).not.toBeChecked()

    for (const name of [
      'C sharp / D flat',
      'D sharp / E flat',
      'F sharp / G flat',
      'G sharp / A flat',
      'A sharp / B flat',
    ]) {
      const btn = piano.getByRole('button', { name })
      await expect(btn).toHaveText('')
    }
    await expect(piano.getByRole('button', { name: 'C', exact: true })).toContainText('C')
  })

  test('both toggles off hide every visible letter on the piano', async ({ page }) => {
    await page.goto('/')
    const piano = page.getByRole('group', { name: /piano picker/i })

    await openSettings(page)
    await findToggle(page, /^show piano labels$/i).label.click()
    await findToggle(page, /^show black-key labels$/i).label.click()

    const buttons = piano.getByRole('button')
    const count = await buttons.count()
    for (let i = 0; i < count; i++) {
      await expect(buttons.nth(i)).toHaveText('')
    }
  })

  test('toggling labels back on restores them', async ({ page }) => {
    await page.goto('/')
    const piano = page.getByRole('group', { name: /piano picker/i })

    await openSettings(page)
    const whiteToggle = findToggle(page, /^show piano labels$/i)
    const blackToggle = findToggle(page, /^show black-key labels$/i)

    await whiteToggle.label.click()
    await blackToggle.label.click()
    await whiteToggle.label.click()
    await blackToggle.label.click()
    await expect(whiteToggle.input).toBeChecked()
    await expect(blackToggle.input).toBeChecked()

    await expect(piano.getByRole('button', { name: 'C', exact: true })).toContainText('C')
    await expect(piano.getByRole('button', { name: 'C sharp / D flat' })).toContainText('C#')
  })
})
