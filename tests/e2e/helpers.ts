import { expect, type Page } from '@playwright/test'

// Open the settings drawer. All persistable settings (toggles + notation
// control) live inside it now, so any E2E that needs to flip a setting
// should open the drawer first.
export async function openSettings(page: Page): Promise<void> {
  await page.getByRole('button', { name: /open settings/i }).click()
  await expect(page.getByRole('dialog', { name: /settings/i })).toBeVisible()
}

export async function closeSettings(page: Page): Promise<void> {
  await page.getByRole('button', { name: /close settings/i }).click()
}
