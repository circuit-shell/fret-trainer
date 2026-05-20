import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { InlayDotsToggle } from '../../components/InlayDotsToggle'

describe('InlayDotsToggle', () => {
  it('renders a checkbox labeled "Show inlay dots"', () => {
    render(<InlayDotsToggle visible onChange={vi.fn()} />)
    expect(screen.getByRole('switch', { name: /show inlay dots/i })).toBeInTheDocument()
  })

  it('reflects the visible prop via aria-checked', () => {
    const { rerender } = render(<InlayDotsToggle visible onChange={vi.fn()} />)
    expect(screen.getByRole('switch')).toBeChecked()
    rerender(<InlayDotsToggle visible={false} onChange={vi.fn()} />)
    expect(screen.getByRole('switch')).not.toBeChecked()
  })

  it('calls onChange with the toggled value when clicked', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<InlayDotsToggle visible onChange={onChange} />)
    await user.click(screen.getByRole('switch'))
    expect(onChange).toHaveBeenCalledWith(false)
  })

  it('toggles from hidden to visible on click', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<InlayDotsToggle visible={false} onChange={onChange} />)
    await user.click(screen.getByRole('switch'))
    expect(onChange).toHaveBeenCalledWith(true)
  })
})
