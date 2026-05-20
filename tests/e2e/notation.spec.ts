import { test, expect } from '@playwright/test'
import { openSettings } from './helpers'

test.describe('notation system — Letters ↔ Solfège', () => {
  test('defaults to Letters; flipping to Solfège relabels every visible note', async ({
    page,
  }) => {
    await page.goto('/')
    await openSettings(page)
    const group = page.getByRole('group', { name: /notation system/i })
    const lettersBtn = group.getByRole('button', { name: /letters notation/i })
    const solfegeBtn = group.getByRole('button', { name: /solfège notation/i })

    // Defaults
    await expect(lettersBtn).toHaveAttribute('aria-pressed', 'true')
    await expect(solfegeBtn).toHaveAttribute('aria-pressed', 'false')

    const piano = page.getByRole('group', { name: /piano picker/i })
    await expect(piano.getByRole('button', { name: 'C', exact: true })).toContainText('C')
    await expect(piano.getByRole('button', { name: 'F sharp / G flat' })).toContainText('F#')

    // Switch to Solfège.
    await solfegeBtn.click()
    await expect(solfegeBtn).toHaveAttribute('aria-pressed', 'true')

    await expect(piano.getByRole('button', { name: 'C', exact: true })).toContainText('Do')
    await expect(piano.getByRole('button', { name: 'A', exact: true })).toContainText('La')

    const fsKey = piano.getByRole('button', { name: 'F sharp / G flat' })
    await expect(fsKey).toContainText('Fa#')
    await expect(fsKey).toContainText('Solb')

    await expect(page.getByTestId('reference-marker-6-0-label')).toHaveText('Mi')
    await expect(page.getByTestId('reference-marker-3-0-label')).toHaveText('Sol')
  })

  test('target-note display follows the notation toggle and stays width-stable across switches', async ({
    page,
  }) => {
    await page.goto('/')
    const piano = page.getByRole('group', { name: /piano picker/i })

    // Pick F# in letter mode.
    await piano.getByRole('button', { name: 'F sharp / G flat' }).click()
    const targetBtn = page.getByRole('button', { name: /re-roll random note/i })
    await expect(targetBtn).toContainText('F#/Gb')
    const baseline = await targetBtn.boundingBox()

    await openSettings(page)
    const lettersBtn = page.getByRole('button', { name: /letters notation/i })
    const solfegeBtn = page.getByRole('button', { name: /solfège notation/i })

    await solfegeBtn.click()
    await expect(targetBtn).toContainText('Fa#/Solb')
    const afterSolfege = await targetBtn.boundingBox()
    expect(afterSolfege?.width).toBe(baseline?.width)

    await lettersBtn.click()
    await expect(targetBtn).toContainText('F#/Gb')
    const afterBack = await targetBtn.boundingBox()
    expect(afterBack?.width).toBe(baseline?.width)
  })
})
