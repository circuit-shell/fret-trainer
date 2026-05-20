import { test, expect } from '@playwright/test'

test.describe('session timer — tap to play/pause, icon to reset, 15-min cap', () => {
  test('tap-to-toggle: idle → running → paused → running; reset returns to 00:00', async ({
    page,
  }) => {
    await page.goto('/')

    const timer = page.getByRole('group', { name: /session timer/i })
    await expect(timer).toBeVisible()
    await expect(timer).toContainText('00:00')

    // Tap the time button to start.
    const timeButton = timer.getByRole('button', { name: /start session timer/i })
    await timeButton.click()
    await page.waitForTimeout(2_100)

    // Display has advanced past 00:00.
    const afterStart = (await timer.innerText()).match(/\d{2}:\d{2}/)?.[0]
    expect(afterStart).toBeDefined()
    expect(afterStart).not.toBe('00:00')

    // Tap again to pause. The button's accessible name flips to "Resume…".
    await timer.getByRole('button', { name: /pause session timer/i }).click()
    const frozen = (await timer.innerText()).match(/\d{2}:\d{2}/)?.[0]
    await page.waitForTimeout(1_500)
    const stillFrozen = (await timer.innerText()).match(/\d{2}:\d{2}/)?.[0]
    expect(stillFrozen).toBe(frozen)

    // Tap to resume.
    await timer.getByRole('button', { name: /resume session timer/i }).click()
    await page.waitForTimeout(1_500)
    const afterResume = (await timer.innerText()).match(/\d{2}:\d{2}/)?.[0]
    expect(afterResume).not.toBe(frozen)

    // Click the small reset icon button to clear everything.
    await timer.getByRole('button', { name: /reset session timer/i }).click()
    await expect(timer).toContainText('00:00')
    await expect(timer.getByRole('button', { name: /start session timer/i })).toBeVisible()
  })

  test('Reset also clears the current round: target note, piano selection, and attempt markers', async ({
    page,
  }) => {
    await page.goto('/')
    const timer = page.getByRole('group', { name: /session timer/i })
    const piano = page.getByRole('group', { name: /piano picker/i })

    // Set up an in-progress round: pick C and make one incorrect tap.
    await piano.getByRole('button', { name: 'C', exact: true }).click()
    const cKey = piano.getByRole('button', { name: 'C', exact: true })
    await expect(cKey).toHaveAttribute('aria-pressed', 'true')

    const wrongCell = page.getByRole('button', { name: /String 6.*fret 1\b/i })
    await wrongCell.click()
    await expect(wrongCell).toHaveAttribute('data-attempt', 'incorrect')

    // Start the timer so we can verify it resets too.
    await timer.getByRole('button', { name: /start session timer/i }).click()
    await page.waitForTimeout(1_500)

    // Click the reset icon.
    await timer.getByRole('button', { name: /reset session timer/i }).click()

    // Timer back to 00:00 with a Start aria-label.
    await expect(timer).toContainText('00:00')
    await expect(timer.getByRole('button', { name: /start session timer/i })).toBeVisible()

    // The piano has no key pressed.
    await expect(piano.getByRole('button', { pressed: true })).toHaveCount(0)

    // The fretboard attempt marker is gone.
    await expect(wrongCell).not.toHaveAttribute('data-attempt', 'incorrect')

    // The target-note display shows the treble-clef placeholder again.
    await expect(page.getByRole('img', { name: /treble clef/i })).toBeVisible()
  })

  test('the reset icon button renders an SVG icon', async ({ page }) => {
    await page.goto('/')
    const timer = page.getByRole('group', { name: /session timer/i })
    const resetBtn = timer.getByRole('button', { name: /reset session timer/i })
    await expect(resetBtn.getByRole('img', { name: /reset/i })).toBeVisible()
  })

  test('the MM:SS display does not change width as time progresses', async ({ page }) => {
    await page.goto('/')
    const timer = page.getByRole('group', { name: /session timer/i })
    const timeBtn = timer.getByRole('button', { name: /start session timer/i })

    const widthAt = async () => {
      const box = await timer
        .getByRole('button', { name: /(start|pause|resume) session timer/i })
        .boundingBox()
      expect(box).not.toBeNull()
      return box!.width
    }

    const baseline = await widthAt()
    await timeBtn.click() // start running

    // Sample at multiple ticks. Width must stay identical at every observation.
    for (let i = 0; i < 4; i++) {
      await page.waitForTimeout(1_100)
      expect(await widthAt()).toBe(baseline)
    }
  })
})
