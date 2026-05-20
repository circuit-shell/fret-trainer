import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ReferenceNamesToggle } from '../../components/ReferenceNamesToggle'

describe('ReferenceNamesToggle', () => {
  it('renders a checkbox labeled "Show reference note names"', () => {
    render(<ReferenceNamesToggle visible onChange={vi.fn()} />)
    expect(
      screen.getByRole('switch', { name: /show reference note names/i }),
    ).toBeInTheDocument()
  })

  it('reflects the visible prop via aria-checked', () => {
    const { rerender } = render(<ReferenceNamesToggle visible onChange={vi.fn()} />)
    expect(screen.getByRole('switch')).toBeChecked()
    rerender(<ReferenceNamesToggle visible={false} onChange={vi.fn()} />)
    expect(screen.getByRole('switch')).not.toBeChecked()
  })

  it('calls onChange with the toggled value when clicked', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<ReferenceNamesToggle visible onChange={onChange} />)
    await user.click(screen.getByRole('switch'))
    expect(onChange).toHaveBeenCalledWith(false)
  })

  it('toggles from hidden to visible on click', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<ReferenceNamesToggle visible={false} onChange={onChange} />)
    await user.click(screen.getByRole('switch'))
    expect(onChange).toHaveBeenCalledWith(true)
  })

  describe('when disabled', () => {
    it('marks the underlying input as disabled', () => {
      render(<ReferenceNamesToggle visible disabled onChange={vi.fn()} />)
      expect(screen.getByRole('switch')).toBeDisabled()
    })

    it('does not call onChange when the user clicks the label', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()
      render(<ReferenceNamesToggle visible disabled onChange={onChange} />)
      // userEvent ignores clicks on a disabled checkbox.
      await user.click(screen.getByRole('switch'))
      expect(onChange).not.toHaveBeenCalled()
    })

    it('still reflects its underlying checked state', () => {
      const { rerender } = render(<ReferenceNamesToggle visible disabled onChange={vi.fn()} />)
      expect(screen.getByRole('switch')).toBeChecked()
      rerender(<ReferenceNamesToggle visible={false} disabled onChange={vi.fn()} />)
      expect(screen.getByRole('switch')).not.toBeChecked()
    })
  })
})
