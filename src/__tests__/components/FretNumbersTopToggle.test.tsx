import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FretNumbersTopToggle } from '../../components/FretNumbersTopToggle'

describe('FretNumbersTopToggle', () => {
  it('renders a checkbox labeled "Fret numbers on top"', () => {
    render(<FretNumbersTopToggle visible onChange={vi.fn()} />)
    expect(screen.getByRole('switch', { name: /fret numbers on top/i })).toBeInTheDocument()
  })

  it('reflects the visible prop via aria-checked', () => {
    const { rerender } = render(<FretNumbersTopToggle visible onChange={vi.fn()} />)
    expect(screen.getByRole('switch')).toBeChecked()
    rerender(<FretNumbersTopToggle visible={false} onChange={vi.fn()} />)
    expect(screen.getByRole('switch')).not.toBeChecked()
  })

  it('calls onChange with the toggled value when clicked', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<FretNumbersTopToggle visible onChange={onChange} />)
    await user.click(screen.getByRole('switch'))
    expect(onChange).toHaveBeenCalledWith(false)
  })

  it('toggles from hidden to visible on click', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<FretNumbersTopToggle visible={false} onChange={onChange} />)
    await user.click(screen.getByRole('switch'))
    expect(onChange).toHaveBeenCalledWith(true)
  })
})
