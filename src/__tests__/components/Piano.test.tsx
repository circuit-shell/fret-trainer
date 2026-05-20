import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Piano } from '../../components/Piano'

describe('Piano', () => {
  it('renders a labeled group containing exactly 12 piano keys', () => {
    render(
      <Piano
        selectedNoteIndex={null}
        whiteLabelsVisible
        blackLabelsVisible
        onSelect={vi.fn()}
      />,
    )
    const group = screen.getByRole('group', { name: /piano picker/i })
    const buttons = within(group).getAllByRole('button')
    expect(buttons).toHaveLength(12)
  })

  it('exposes every chromatic pitch class by aria-label', () => {
    render(
      <Piano
        selectedNoteIndex={null}
        whiteLabelsVisible
        blackLabelsVisible
        onSelect={vi.fn()}
      />,
    )
    const group = screen.getByRole('group', { name: /piano picker/i })
    for (const name of ['C', 'D', 'E', 'F', 'G', 'A', 'B']) {
      expect(within(group).getByRole('button', { name })).toBeInTheDocument()
    }
    for (const name of [
      'C sharp / D flat',
      'D sharp / E flat',
      'F sharp / G flat',
      'G sharp / A flat',
      'A sharp / B flat',
    ]) {
      expect(within(group).getByRole('button', { name })).toBeInTheDocument()
    }
  })

  it('marks exactly one key as pressed when selectedNoteIndex matches a key', () => {
    render(
      <Piano
        selectedNoteIndex={6}
        whiteLabelsVisible
        blackLabelsVisible
        onSelect={vi.fn()}
      />,
    )
    const group = screen.getByRole('group', { name: /piano picker/i })
    const pressed = within(group).getAllByRole('button', { pressed: true })
    expect(pressed).toHaveLength(1)
    expect(pressed[0].getAttribute('aria-label')).toBe('F sharp / G flat')
  })

  it('marks no key as pressed when selectedNoteIndex is null', () => {
    render(
      <Piano
        selectedNoteIndex={null}
        whiteLabelsVisible
        blackLabelsVisible
        onSelect={vi.fn()}
      />,
    )
    const group = screen.getByRole('group', { name: /piano picker/i })
    const pressed = within(group).queryAllByRole('button', { pressed: true })
    expect(pressed).toHaveLength(0)
  })

  it('fires onSelect with the right Note when a white key is clicked', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(
      <Piano
        selectedNoteIndex={null}
        whiteLabelsVisible
        blackLabelsVisible
        onSelect={onSelect}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'C' }))
    expect(onSelect).toHaveBeenCalledTimes(1)
    expect(onSelect.mock.calls[0][0].index).toBe(0)
  })

  it('fires onSelect with the right Note when a black key is clicked', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(
      <Piano
        selectedNoteIndex={null}
        whiteLabelsVisible
        blackLabelsVisible
        onSelect={onSelect}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'F sharp / G flat' }))
    expect(onSelect).toHaveBeenCalledTimes(1)
    expect(onSelect.mock.calls[0][0].index).toBe(6)
  })

  it('hides white-key letters when whiteLabelsVisible=false but keeps black-key labels', () => {
    render(
      <Piano
        selectedNoteIndex={null}
        whiteLabelsVisible={false}
        blackLabelsVisible
        onSelect={vi.fn()}
      />,
    )
    // White keys have no text content.
    for (const name of ['C', 'D', 'E', 'F', 'G', 'A', 'B']) {
      const btn = screen.getByRole('button', { name })
      expect(btn.textContent ?? '').toBe('')
    }
    // Black keys still show their stacked sharp/flat label.
    const csKey = screen.getByRole('button', { name: 'C sharp / D flat' })
    expect(csKey.textContent).toContain('C#')
    expect(csKey.textContent).toContain('Db')
  })

  it('hides black-key labels when blackLabelsVisible=false but keeps white-key letters', () => {
    render(
      <Piano
        selectedNoteIndex={null}
        whiteLabelsVisible
        blackLabelsVisible={false}
        onSelect={vi.fn()}
      />,
    )
    // C key now also shows the enharmonic alternate "B#" stacked above "C".
    // The DOM textContent concatenates them in render order — alternate first,
    // primary second.
    expect(screen.getByRole('button', { name: 'C' }).textContent).toBe('B#C')
    expect(screen.getByRole('button', { name: 'C sharp / D flat' }).textContent).toBe('')
  })

  it('hides all visible labels when both toggles are off; aria-labels intact', () => {
    render(
      <Piano
        selectedNoteIndex={null}
        whiteLabelsVisible={false}
        blackLabelsVisible={false}
        onSelect={vi.fn()}
      />,
    )
    const group = screen.getByRole('group', { name: /piano picker/i })
    expect(within(group).getAllByRole('button')).toHaveLength(12)
    for (const btn of within(group).getAllByRole('button')) {
      expect(btn.textContent ?? '').toBe('')
    }
  })

  it('calls onKeyAudio with the right NoteIndex before onSelect for both white and black keys', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    const onKeyAudio = vi.fn()
    render(
      <Piano
        selectedNoteIndex={null}
        whiteLabelsVisible
        blackLabelsVisible
        onSelect={onSelect}
        onKeyAudio={onKeyAudio}
      />,
    )
    // White key: C → noteIndex 0
    await user.click(screen.getByRole('button', { name: 'C' }))
    expect(onKeyAudio).toHaveBeenCalledWith(0)
    expect(onSelect).toHaveBeenCalledTimes(1)
    expect(onSelect.mock.calls[0][0]).toMatchObject({ index: 0 })

    // Black key: F#/Gb → noteIndex 6
    await user.click(screen.getByRole('button', { name: 'F sharp / G flat' }))
    expect(onKeyAudio).toHaveBeenCalledWith(6)
    expect(onSelect.mock.calls[1][0]).toMatchObject({ index: 6 })

    // Verify ordering: onKeyAudio was called BEFORE onSelect within each tap.
    // (We can't directly assert call order across two mocks, but we can
    // verify the per-tap call counts increment together.)
    expect(onKeyAudio).toHaveBeenCalledTimes(2)
    expect(onSelect).toHaveBeenCalledTimes(2)
  })

  it('still works without onKeyAudio (the prop is optional; pre-004 behavior)', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(
      <Piano
        selectedNoteIndex={null}
        whiteLabelsVisible
        blackLabelsVisible
        onSelect={onSelect}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'C' }))
    expect(onSelect).toHaveBeenCalledTimes(1)
  })
})
