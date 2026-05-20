import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ReferenceToggle } from '../../components/ReferenceToggle'

describe('ReferenceToggle', () => {
  it('renders a checkbox labeled "Show reference notes"', () => {
    render(<ReferenceToggle visible onChange={vi.fn()} />)
    const cb = screen.getByRole('switch', { name: /show reference notes/i })
    expect(cb).toBeInTheDocument()
  })

  it('reflects the visible prop via aria-checked', () => {
    const { rerender } = render(<ReferenceToggle visible onChange={vi.fn()} />)
    expect(screen.getByRole('switch')).toBeChecked()
    rerender(<ReferenceToggle visible={false} onChange={vi.fn()} />)
    expect(screen.getByRole('switch')).not.toBeChecked()
  })

  it('calls onChange with the toggled value when clicked', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<ReferenceToggle visible onChange={onChange} />)
    await user.click(screen.getByRole('switch'))
    expect(onChange).toHaveBeenCalledWith(false)
  })

  it('toggles from hidden to visible on click', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<ReferenceToggle visible={false} onChange={onChange} />)
    await user.click(screen.getByRole('switch'))
    expect(onChange).toHaveBeenCalledWith(true)
  })
})
