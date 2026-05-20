import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FretNumbersBottomToggle } from '../../components/FretNumbersBottomToggle'

describe('FretNumbersBottomToggle', () => {
  it('renders a checkbox labeled "Fret numbers on bottom"', () => {
    render(<FretNumbersBottomToggle visible onChange={vi.fn()} />)
    expect(screen.getByRole('switch', { name: /fret numbers on bottom/i })).toBeInTheDocument()
  })

  it('reflects the visible prop via aria-checked', () => {
    const { rerender } = render(<FretNumbersBottomToggle visible onChange={vi.fn()} />)
    expect(screen.getByRole('switch')).toBeChecked()
    rerender(<FretNumbersBottomToggle visible={false} onChange={vi.fn()} />)
    expect(screen.getByRole('switch')).not.toBeChecked()
  })

  it('calls onChange with the toggled value when clicked', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<FretNumbersBottomToggle visible onChange={onChange} />)
    await user.click(screen.getByRole('switch'))
    expect(onChange).toHaveBeenCalledWith(false)
  })

  it('toggles from hidden to visible on click', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<FretNumbersBottomToggle visible={false} onChange={onChange} />)
    await user.click(screen.getByRole('switch'))
    expect(onChange).toHaveBeenCalledWith(true)
  })
})
