import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { FretCountControl } from '../../components/FretCountControl'

describe('FretCountControl', () => {
  it('renders a labeled range input with the current value', () => {
    render(<FretCountControl value={15} onChange={vi.fn()} />)
    const input = screen.getByRole('slider', { name: /number of frets shown/i })
    expect(input).toHaveAttribute('min', '12')
    expect(input).toHaveAttribute('max', '24')
    expect(input).toHaveValue('15')
    expect(screen.getByText('15')).toBeInTheDocument()
  })

  it('emits the new clamped value when the user changes the slider', () => {
    const onChange = vi.fn()
    render(<FretCountControl value={12} onChange={onChange} />)
    const input = screen.getByRole('slider', { name: /number of frets shown/i })
    fireEvent.change(input, { target: { value: '19' } })
    expect(onChange).toHaveBeenCalledWith(19)
  })

  it('clamps values below the minimum to 12', () => {
    render(<FretCountControl value={5} onChange={vi.fn()} />)
    const input = screen.getByRole('slider', { name: /number of frets shown/i })
    expect(input).toHaveValue('12')
  })

  it('clamps values above the maximum to 24', () => {
    render(<FretCountControl value={99} onChange={vi.fn()} />)
    const input = screen.getByRole('slider', { name: /number of frets shown/i })
    expect(input).toHaveValue('24')
  })
})
