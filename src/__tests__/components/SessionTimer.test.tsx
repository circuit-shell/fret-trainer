import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SessionTimer } from '../../components/SessionTimer'

const baseProps = {
  onToggle: vi.fn(),
  onReset: vi.fn(),
}

describe('SessionTimer', () => {
  it('renders 00:00 in idle state and exposes a toggle button + reset button', () => {
    render(<SessionTimer status="idle" elapsedMs={0} isAtCap={false} {...baseProps} />)
    expect(screen.getByText('00:00')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /start session timer/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /reset session timer/i })).toBeInTheDocument()
  })

  it('aria-label switches to "Pause session timer" when running', () => {
    render(<SessionTimer status="running" elapsedMs={30_000} isAtCap={false} {...baseProps} />)
    expect(screen.getByText('00:30')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /pause session timer/i })).toBeInTheDocument()
  })

  it('aria-label switches to "Resume session timer" when paused (and not at cap)', () => {
    render(<SessionTimer status="paused" elapsedMs={75_000} isAtCap={false} {...baseProps} />)
    expect(screen.getByText('01:15')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /resume session timer/i })).toBeInTheDocument()
  })

  it('aria-label reflects the 15-minute cap when isAtCap=true', () => {
    render(<SessionTimer status="paused" elapsedMs={15 * 60 * 1000} isAtCap {...baseProps} />)
    expect(screen.getByText('15:00')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /reached 15-minute cap/i })).toBeInTheDocument()
  })

  it('formats elapsed time as MM:SS for any time under the cap', () => {
    render(
      <SessionTimer
        status="running"
        elapsedMs={(5 * 60 + 7) * 1000}
        isAtCap={false}
        {...baseProps}
      />,
    )
    expect(screen.getByText('05:07')).toBeInTheDocument()
  })

  it('fires onToggle when the time button is clicked', async () => {
    const user = userEvent.setup()
    const onToggle = vi.fn()
    render(
      <SessionTimer
        status="idle"
        elapsedMs={0}
        isAtCap={false}
        onToggle={onToggle}
        onReset={vi.fn()}
      />,
    )
    await user.click(screen.getByRole('button', { name: /start session timer/i }))
    expect(onToggle).toHaveBeenCalledTimes(1)
  })

  it('fires onReset when the reset icon button is clicked', async () => {
    const user = userEvent.setup()
    const onReset = vi.fn()
    render(
      <SessionTimer
        status="paused"
        elapsedMs={10_000}
        isAtCap={false}
        onToggle={vi.fn()}
        onReset={onReset}
      />,
    )
    await user.click(screen.getByRole('button', { name: /reset session timer/i }))
    expect(onReset).toHaveBeenCalledTimes(1)
  })

  it('disables the toggle button when at the cap, but the reset stays clickable', async () => {
    const user = userEvent.setup()
    const onToggle = vi.fn()
    const onReset = vi.fn()
    render(
      <SessionTimer
        status="paused"
        elapsedMs={15 * 60 * 1000}
        isAtCap
        onToggle={onToggle}
        onReset={onReset}
      />,
    )
    const toggle = screen.getByRole('button', { name: /reached 15-minute cap/i })
    expect(toggle).toBeDisabled()
    await user.click(toggle)
    expect(onToggle).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: /reset session timer/i }))
    expect(onReset).toHaveBeenCalledTimes(1)
  })

  it('renders a reset icon SVG with role=img inside the reset button', () => {
    render(<SessionTimer status="idle" elapsedMs={0} isAtCap={false} {...baseProps} />)
    expect(screen.getByRole('img', { name: /reset/i })).toBeInTheDocument()
  })
})
