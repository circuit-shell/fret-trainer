import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SettingsDrawer } from '../../components/SettingsDrawer'
import { DEFAULT_SETTINGS, type Settings } from '../../domain/settings'

function renderDrawer(overrides: Partial<Settings> = {}, onChange = vi.fn()) {
  const settings: Settings = { ...DEFAULT_SETTINGS, ...overrides }
  render(
    <SettingsDrawer
      open
      settings={settings}
      onChange={onChange}
      onResetDefaults={vi.fn()}
      onClose={vi.fn()}
    />,
  )
  return { settings, onChange }
}

describe('SettingsDrawer — Sound toggle (US3 wiring)', () => {
  it('renders the Sound toggle inside the Audio section, reflecting the current setting', () => {
    renderDrawer({ soundEnabled: false })
    const audio = screen.getByRole('region', { name: /audio/i })
    const sw = within(audio).getByRole('switch', { name: /sound/i })
    expect(sw).toHaveAttribute('aria-checked', 'false')
  })

  it('dispatches onChange("soundEnabled", true) when the toggle is clicked from off', async () => {
    const user = userEvent.setup()
    const { onChange } = renderDrawer({ soundEnabled: false })
    await user.click(screen.getByRole('switch', { name: /sound/i }))
    expect(onChange).toHaveBeenCalledWith('soundEnabled', true)
  })

  it('dispatches onChange("soundEnabled", false) when the toggle is clicked from on', async () => {
    const user = userEvent.setup()
    const { onChange } = renderDrawer({ soundEnabled: true })
    await user.click(screen.getByRole('switch', { name: /sound/i }))
    expect(onChange).toHaveBeenCalledWith('soundEnabled', false)
  })

  it('the Audio section is visibly its own section heading (consistent with the other section family)', () => {
    renderDrawer()
    const audio = screen.getByRole('region', { name: /audio/i })
    const heading = within(audio).getByRole('heading', { level: 3 })
    expect(heading).toHaveTextContent(/audio/i)
  })
})
