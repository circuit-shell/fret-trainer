import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SoundToggle } from '../../components/SoundToggle'

describe('SoundToggle', () => {
  it('renders a switch labeled "Sound"', () => {
    render(<SoundToggle enabled={false} onChange={vi.fn()} />)
    expect(screen.getByRole('switch', { name: /sound/i })).toBeInTheDocument()
  })

  it('reflects the enabled prop via aria-checked', () => {
    const { rerender } = render(<SoundToggle enabled={false} onChange={vi.fn()} />)
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false')
    rerender(<SoundToggle enabled onChange={vi.fn()} />)
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true')
  })

  it('calls onChange(true) when clicked from off', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<SoundToggle enabled={false} onChange={onChange} />)
    await user.click(screen.getByRole('switch'))
    expect(onChange).toHaveBeenCalledWith(true)
  })

  it('calls onChange(false) when clicked from on', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<SoundToggle enabled onChange={onChange} />)
    await user.click(screen.getByRole('switch'))
    expect(onChange).toHaveBeenCalledWith(false)
  })

  it('keyboard activation (Space) also dispatches onChange', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<SoundToggle enabled={false} onChange={onChange} />)
    const sw = screen.getByRole('switch')
    sw.focus()
    await user.keyboard(' ')
    expect(onChange).toHaveBeenCalledWith(true)
  })
})
