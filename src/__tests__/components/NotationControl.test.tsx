import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NotationControl } from '../../components/NotationControl'

describe('NotationControl', () => {
  it('renders two buttons inside a labeled group', () => {
    render(<NotationControl notation="letter" onChange={vi.fn()} />)
    expect(screen.getByRole('group', { name: /notation system/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /letters notation/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /solfège notation/i })).toBeInTheDocument()
  })

  it.each([
    ['letter', /letters notation/i],
    ['solfege', /solfège notation/i],
  ] as const)('marks the %s button as pressed when notation=%s', (notation, name) => {
    render(<NotationControl notation={notation} onChange={vi.fn()} />)
    const pressed = screen.getAllByRole('button', { pressed: true })
    expect(pressed).toHaveLength(1)
    expect(pressed[0]).toHaveAccessibleName(name)
  })

  it('calls onChange with the clicked notation', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<NotationControl notation="letter" onChange={onChange} />)
    await user.click(screen.getByRole('button', { name: /solfège notation/i }))
    expect(onChange).toHaveBeenCalledWith('solfege')
    await user.click(screen.getByRole('button', { name: /letters notation/i }))
    expect(onChange).toHaveBeenLastCalledWith('letter')
  })
})
