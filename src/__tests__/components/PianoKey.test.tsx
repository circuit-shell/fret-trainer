import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PianoKey } from '../../components/PianoKey'

describe('PianoKey — white variant', () => {
  it('renders a button with the given aria-label', () => {
    render(
      <PianoKey
        variant="white"
        noteIndex={0}
        visibleLabel="C"
        ariaLabel="C"
        selected={false}
        labelsVisible
        onSelect={vi.fn()}
      />,
    )
    expect(screen.getByRole('button', { name: 'C' })).toBeInTheDocument()
  })

  it('shows the visible label when labelsVisible is true', () => {
    render(
      <PianoKey
        variant="white"
        noteIndex={0}
        visibleLabel="C"
        ariaLabel="C"
        selected={false}
        labelsVisible
        onSelect={vi.fn()}
      />,
    )
    expect(screen.getByText('C')).toBeInTheDocument()
  })

  it('hides the visible label when labelsVisible is false but keeps the aria-label', () => {
    render(
      <PianoKey
        variant="white"
        noteIndex={0}
        visibleLabel="C"
        ariaLabel="C"
        selected={false}
        labelsVisible={false}
        onSelect={vi.fn()}
      />,
    )
    const button = screen.getByRole('button', { name: 'C' })
    expect(button).toBeInTheDocument()
    // The visible "C" text should not be rendered as a child.
    expect(button.textContent ?? '').toBe('')
  })

  it('sets aria-pressed=true when selected', () => {
    render(
      <PianoKey
        variant="white"
        noteIndex={0}
        visibleLabel="C"
        ariaLabel="C"
        selected
        labelsVisible
        onSelect={vi.fn()}
      />,
    )
    expect(screen.getByRole('button', { name: 'C' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('fires onSelect with the noteIndex when clicked', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(
      <PianoKey
        variant="white"
        noteIndex={7}
        visibleLabel="G"
        ariaLabel="G"
        selected={false}
        labelsVisible
        onSelect={onSelect}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'G' }))
    expect(onSelect).toHaveBeenCalledTimes(1)
    expect(onSelect).toHaveBeenCalledWith(7)
  })
})

describe('PianoKey — black variant', () => {
  it('renders a button with the given aria-label', () => {
    render(
      <PianoKey
        variant="black"
        noteIndex={1}
        visibleLabel={{ sharp: 'C#', flat: 'Db' }}
        ariaLabel="C sharp / D flat"
        selected={false}
        labelsVisible
        onSelect={vi.fn()}
      />,
    )
    expect(screen.getByRole('button', { name: 'C sharp / D flat' })).toBeInTheDocument()
  })

  it('shows both sharp and flat labels stacked when labelsVisible', () => {
    render(
      <PianoKey
        variant="black"
        noteIndex={1}
        visibleLabel={{ sharp: 'C#', flat: 'Db' }}
        ariaLabel="C sharp / D flat"
        selected={false}
        labelsVisible
        onSelect={vi.fn()}
      />,
    )
    const button = screen.getByRole('button', { name: 'C sharp / D flat' })
    expect(button.textContent).toContain('C#')
    expect(button.textContent).toContain('Db')
  })

  it('hides both labels when labelsVisible is false', () => {
    render(
      <PianoKey
        variant="black"
        noteIndex={1}
        visibleLabel={{ sharp: 'C#', flat: 'Db' }}
        ariaLabel="C sharp / D flat"
        selected={false}
        labelsVisible={false}
        onSelect={vi.fn()}
      />,
    )
    const button = screen.getByRole('button', { name: 'C sharp / D flat' })
    expect(button.textContent ?? '').toBe('')
  })

  it('fires onSelect with the noteIndex when clicked', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(
      <PianoKey
        variant="black"
        noteIndex={6}
        visibleLabel={{ sharp: 'F#', flat: 'Gb' }}
        ariaLabel="F sharp / G flat"
        selected={false}
        labelsVisible
        onSelect={onSelect}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'F sharp / G flat' }))
    expect(onSelect).toHaveBeenCalledTimes(1)
    expect(onSelect).toHaveBeenCalledWith(6)
  })
})
