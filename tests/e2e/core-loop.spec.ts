import { test, expect } from '@playwright/test'

test.describe('US1 — core training loop', () => {
  test('manual pick → tap wrong → tap right on all six strings → complete banner', async ({
    page,
  }) => {
    await page.goto('/')

    await expect(page.getByRole('group', { name: /piano picker/i })).toBeVisible()
    await expect(page.getByRole('grid', { name: /fretboard/i })).toBeVisible()

    // Pick C from the piano (scope to the piano so we don't match fretboard cells).
    const piano = page.getByRole('group', { name: /piano picker/i })
    await piano.getByRole('button', { name: 'C', exact: true }).click()
    // The piano's C key should now be aria-pressed.
    await expect(piano.getByRole('button', { name: 'C', exact: true })).toHaveAttribute(
      'aria-pressed',
      'true',
    )

    // C positions (one valid octave per string):
    const cPositions: Array<{ string: 1 | 2 | 3 | 4 | 5 | 6; fret: number }> = [
      { string: 6, fret: 8 },
      { string: 5, fret: 3 },
      { string: 4, fret: 10 },
      { string: 3, fret: 5 },
      { string: 2, fret: 1 },
      { string: 1, fret: 8 },
    ]

    // First, tap an obviously wrong cell on string 6 (fret 1 = F, not C).
    const wrong = page.getByRole('button', { name: /String 6.*fret 1\b/i })
    await wrong.click()
    await expect(wrong).toHaveAttribute('data-attempt', 'incorrect')

    // Then tap the right cell on each string in turn.
    for (const pos of cPositions) {
      const cell = page.getByRole('button', {
        name: new RegExp(`String ${pos.string}.*fret ${pos.fret}\\b`, 'i'),
      })
      await cell.click()
      await expect(cell).toHaveAttribute('data-attempt', 'correct')
    }

    // Banner should appear.
    const banner = page.getByRole('status').filter({ hasText: /all six strings/i })
    await expect(banner).toBeVisible()

    // Click "Next random note" — banner should disappear.
    await page.getByRole('button', { name: /next random note/i }).click()
    await expect(banner).toBeHidden()
  })

  test('tapping the target-note display picks a target different from the previously selected note', async ({
    page,
  }) => {
    await page.goto('/')

    // Pick C explicitly from the piano first.
    const piano = page.getByRole('group', { name: /piano picker/i })
    const cKey = piano.getByRole('button', { name: 'C', exact: true })
    await cKey.click()
    await expect(cKey).toHaveAttribute('aria-pressed', 'true')

    // Tap the target-note display to re-roll.
    await page.getByRole('button', { name: /random note/i }).click()
    await expect(cKey).toHaveAttribute('aria-pressed', 'false')

    // Exactly one piano key is now pressed (the new target).
    const pressedPianoButtons = piano.getByRole('button', { pressed: true })
    await expect(pressedPianoButtons).toHaveCount(1)
  })
})
