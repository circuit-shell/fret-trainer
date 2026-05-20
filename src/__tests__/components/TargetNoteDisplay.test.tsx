import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TargetNoteDisplay } from '../../components/TargetNoteDisplay'
import { NOTES } from '../../domain/notes'

describe('TargetNoteDisplay', () => {
  it('renders the treble-clef placeholder when note is null', () => {
    render(<TargetNoteDisplay note={null} onRandom={vi.fn()} />)
    expect(screen.getByRole('img', { name: /treble clef/i })).toBeInTheDocument()
  })

  it('renders just the natural letter for a white-key note (default letter notation)', () => {
    render(<TargetNoteDisplay note={NOTES[0]} onRandom={vi.fn()} />)
    expect(screen.getByText('C')).toBeInTheDocument()
    expect(screen.queryByRole('img', { name: /treble clef/i })).not.toBeInTheDocument()
  })

  it('renders the primary (sharp) name for a black-key note at slot 0 — single name, no slash', () => {
    render(<TargetNoteDisplay note={NOTES[6]} slot={0} onRandom={vi.fn()} />)
    expect(screen.getByText('F#')).toBeInTheDocument()
    expect(screen.queryByText('F#/Gb')).not.toBeInTheDocument()
  })

  it('renders the enharmonic alternate (flat) for a black-key note at slot 1', () => {
    render(<TargetNoteDisplay note={NOTES[6]} slot={1} onRandom={vi.fn()} />)
    expect(screen.getByText('Gb')).toBeInTheDocument()
  })

  it('renders the enharmonic alternate for a white key (e.g., C at slot 1 = B#)', () => {
    render(<TargetNoteDisplay note={NOTES[0]} slot={1} onRandom={vi.fn()} />)
    expect(screen.getByText('B#')).toBeInTheDocument()
  })

  it('uses solfège names when notation="solfege"', () => {
    render(<TargetNoteDisplay note={NOTES[0]} notation="solfege" onRandom={vi.fn()} />)
    expect(screen.getByText('Do')).toBeInTheDocument()
  })

  it('uses solfège single-name form for black keys at slot 0 when notation="solfege"', () => {
    render(<TargetNoteDisplay note={NOTES[6]} notation="solfege" onRandom={vi.fn()} />)
    expect(screen.getByText('Fa#')).toBeInTheDocument()
  })

  it('uses the solfège flat form at slot 1 when notation="solfege"', () => {
    render(<TargetNoteDisplay note={NOTES[6]} slot={1} notation="solfege" onRandom={vi.fn()} />)
    expect(screen.getByText('Solb')).toBeInTheDocument()
  })

  it('is a button (the whole area is clickable)', () => {
    render(<TargetNoteDisplay note={NOTES[0]} onRandom={vi.fn()} />)
    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
  })

  it('fires onRandom when clicked (note=null state)', async () => {
    const user = userEvent.setup()
    const onRandom = vi.fn()
    render(<TargetNoteDisplay note={null} onRandom={onRandom} />)
    await user.click(screen.getByRole('button'))
    expect(onRandom).toHaveBeenCalledTimes(1)
  })

  it('fires onRandom when clicked (note=set state)', async () => {
    const user = userEvent.setup()
    const onRandom = vi.fn()
    render(<TargetNoteDisplay note={NOTES[0]} onRandom={onRandom} />)
    await user.click(screen.getByRole('button'))
    expect(onRandom).toHaveBeenCalledTimes(1)
  })

  it('fires onRandom on Enter and Space when focused', async () => {
    const user = userEvent.setup()
    const onRandom = vi.fn()
    render(<TargetNoteDisplay note={null} onRandom={onRandom} />)
    const button = screen.getByRole('button')
    button.focus()
    await user.keyboard('{Enter}')
    expect(onRandom).toHaveBeenCalledTimes(1)
    await user.keyboard(' ')
    expect(onRandom).toHaveBeenCalledTimes(2)
  })

  it('has a descriptive aria-label that includes the current note when set', () => {
    render(<TargetNoteDisplay note={NOTES[0]} onRandom={vi.fn()} />)
    const button = screen.getByRole('button')
    const label = button.getAttribute('aria-label') ?? ''
    expect(label.toLowerCase()).toContain('re-roll')
    expect(label).toContain('C')
  })

  it('has a "pick a random note" aria-label when no note is set', () => {
    render(<TargetNoteDisplay note={null} onRandom={vi.fn()} />)
    const button = screen.getByRole('button')
    const label = button.getAttribute('aria-label') ?? ''
    expect(label.toLowerCase()).toContain('random')
  })
})
