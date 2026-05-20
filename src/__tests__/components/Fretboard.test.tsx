import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Fretboard } from '../../components/Fretboard'

describe('Fretboard', () => {
  it('renders 6 strings × (maxFret + 1) tap targets for maxFret=12', () => {
    render(
      <Fretboard
        maxFret={12}
        attempts={[]}
        referenceMarkersVisible={false}
        onTap={vi.fn()}
      />,
    )
    const board = screen.getByRole('grid', { name: /fretboard/i })
    const cells = within(board).getAllByRole('button')
    expect(cells).toHaveLength(6 * 13)
  })

  it('emits onTap with the correct (string, fret) when a cell is clicked', async () => {
    const user = userEvent.setup()
    const onTap = vi.fn()
    render(
      <Fretboard
        maxFret={12}
        attempts={[]}
        referenceMarkersVisible={false}
        onTap={onTap}
      />,
    )
    // The 5th fret of the 6th string should be labeled with A (5 + 4 = 9 = A).
    const cell = screen.getByRole('button', { name: /String 6.*fret 5.*A/i })
    await user.click(cell)
    expect(onTap).toHaveBeenCalledTimes(1)
    expect(onTap.mock.calls[0][0]).toEqual({ string: 6, fret: 5 })
  })

  it('marks correct attempts with the data-attempt="correct" indicator', () => {
    render(
      <Fretboard
        maxFret={12}
        attempts={[{ position: { string: 6, fret: 5 }, outcome: 'correct' }]}
        referenceMarkersVisible={false}
        onTap={vi.fn()}
      />,
    )
    const cell = screen.getByRole('button', { name: /String 6.*fret 5/i })
    expect(cell).toHaveAttribute('data-attempt', 'correct')
  })

  it('marks incorrect attempts with the data-attempt="incorrect" indicator', () => {
    render(
      <Fretboard
        maxFret={12}
        attempts={[{ position: { string: 6, fret: 1 }, outcome: 'incorrect' }]}
        referenceMarkersVisible={false}
        onTap={vi.fn()}
      />,
    )
    const cell = screen.getByRole('button', { name: /String 6.*fret 1\b/i })
    expect(cell).toHaveAttribute('data-attempt', 'incorrect')
  })

  it('does not render a separate open-string-labels list (open strings are now reference markers inside fret-0 cells)', () => {
    render(
      <Fretboard
        maxFret={12}
        attempts={[]}
        referenceMarkersVisible
        onTap={vi.fn()}
      />,
    )
    expect(screen.queryByRole('list', { name: /open-string labels/i })).not.toBeInTheDocument()
  })

  it('renders a reference marker at fret 0 of every string, labeled with that open-string note', () => {
    render(
      <Fretboard
        maxFret={12}
        attempts={[]}
        referenceMarkersVisible
        onTap={vi.fn()}
      />,
    )
    // Under the US1 orientation, top→bottom is string 1 (high E), 2 (B), 3 (G),
    // 4 (D), 5 (A), 6 (low E). Each fret-0 marker carries that string's open note.
    const openStringLabels: Array<[number, string]> = [
      [1, 'E'],
      [2, 'B'],
      [3, 'G'],
      [4, 'D'],
      [5, 'A'],
      [6, 'E'],
    ]
    for (const [str, note] of openStringLabels) {
      const label = screen.getByTestId(`reference-marker-${str}-0-label`)
      expect(label).toBeInTheDocument()
      expect(label.textContent).toBe(note)
    }
  })

  it('hides open-string reference markers when referenceMarkersVisible=false', () => {
    render(
      <Fretboard
        maxFret={12}
        attempts={[]}
        referenceMarkersVisible={false}
        onTap={vi.fn()}
      />,
    )
    // No fret-0 marker rendered when the toggle is off.
    for (const str of [1, 2, 3, 4, 5, 6]) {
      expect(screen.queryByTestId(`reference-marker-${str}-0`)).not.toBeInTheDocument()
    }
  })

  it('renders the playing rows top-to-bottom as string 1 → string 6 (US1 orientation)', () => {
    render(
      <Fretboard
        maxFret={12}
        attempts={[]}
        referenceMarkersVisible={false}
        onTap={vi.fn()}
      />,
    )
    const board = screen.getByRole('grid', { name: /fretboard/i })
    const cells = within(board).getAllByRole('button')
    expect(cells[0].getAttribute('aria-label')).toMatch(/String 1\b/)
    expect(cells[cells.length - 1].getAttribute('aria-label')).toMatch(/String 6\b/)
  })

  it('hides reference markers when referenceMarkersVisible=false', () => {
    render(
      <Fretboard
        maxFret={12}
        attempts={[]}
        referenceMarkersVisible={false}
        onTap={vi.fn()}
      />,
    )
    expect(screen.queryByTestId('reference-marker-6-5')).not.toBeInTheDocument()
  })

  it('shows reference markers when referenceMarkersVisible=true', () => {
    render(
      <Fretboard
        maxFret={12}
        attempts={[]}
        referenceMarkersVisible
        onTap={vi.fn()}
      />,
    )
    expect(screen.getByTestId('reference-marker-6-5')).toBeInTheDocument()
    expect(screen.getByTestId('reference-marker-5-5')).toBeInTheDocument()
    expect(screen.getByTestId('reference-marker-4-5')).toBeInTheDocument()
    expect(screen.getByTestId('reference-marker-3-4')).toBeInTheDocument()
    expect(screen.getByTestId('reference-marker-2-5')).toBeInTheDocument()
  })

  it('renders the note name subtly inside each reference marker by default', () => {
    render(
      <Fretboard
        maxFret={12}
        attempts={[]}
        referenceMarkersVisible
        onTap={vi.fn()}
      />,
    )
    // Reference markers and the note their cell produces:
    //   string 6 fret 5 → A
    //   string 5 fret 5 → D
    //   string 4 fret 5 → G
    //   string 3 fret 4 → B
    //   string 2 fret 5 → E
    const expected: Array<[string, number, string]> = [
      ['6', 5, 'A'],
      ['5', 5, 'D'],
      ['4', 5, 'G'],
      ['3', 4, 'B'],
      ['2', 5, 'E'],
    ]
    for (const [str, fret, note] of expected) {
      const label = screen.getByTestId(`reference-marker-${str}-${fret}-label`)
      expect(label).toBeInTheDocument()
      expect(label.textContent).toBe(note)
    }
  })

  it('hides the note name inside reference markers when referenceNamesVisible=false (markers stay)', () => {
    render(
      <Fretboard
        maxFret={12}
        attempts={[]}
        referenceMarkersVisible
        referenceNamesVisible={false}
        onTap={vi.fn()}
      />,
    )
    // Each marker disc is still in the DOM, but the inner label is not.
    expect(screen.getByTestId('reference-marker-6-5')).toBeInTheDocument()
    expect(screen.queryByTestId('reference-marker-6-5-label')).not.toBeInTheDocument()
    expect(screen.getByTestId('reference-marker-3-4')).toBeInTheDocument()
    expect(screen.queryByTestId('reference-marker-3-4-label')).not.toBeInTheDocument()
  })

  it('keeps attempt markers visible even when reference markers are hidden', () => {
    render(
      <Fretboard
        maxFret={12}
        attempts={[{ position: { string: 6, fret: 5 }, outcome: 'correct' }]}
        referenceMarkersVisible={false}
        onTap={vi.fn()}
      />,
    )
    const cell = screen.getByRole('button', { name: /String 6.*fret 5/i })
    expect(cell).toHaveAttribute('data-attempt', 'correct')
  })

  it('marks fret 1 cells with the heavier nut divider class (US3)', () => {
    render(
      <Fretboard
        maxFret={12}
        attempts={[]}
        referenceMarkersVisible={false}
        onTap={vi.fn()}
      />,
    )
    const cell = screen.getByRole('button', { name: /String 1.*fret 1\b/i })
    expect(cell).toHaveAttribute('data-divider', 'nut')
  })

  it('marks fret 2..N cells with the regular fret-wire divider class (US3)', () => {
    render(
      <Fretboard
        maxFret={12}
        attempts={[]}
        referenceMarkersVisible={false}
        onTap={vi.fn()}
      />,
    )
    const cell = screen.getByRole('button', { name: /String 1.*fret 5\b/i })
    expect(cell).toHaveAttribute('data-divider', 'wire')
  })

  it('marks fret 0 (open-string) cells with no divider (no left border)', () => {
    render(
      <Fretboard
        maxFret={12}
        attempts={[]}
        referenceMarkersVisible={false}
        onTap={vi.fn()}
      />,
    )
    const cell = screen.getByRole('button', { name: /String 1.*fret 0\b/i })
    expect(cell).toHaveAttribute('data-divider', 'none')
  })

  it('every fret cell button stretches to fill its grid cell (US4 hit-area fix)', () => {
    render(
      <Fretboard
        maxFret={12}
        attempts={[]}
        referenceMarkersVisible={false}
        onTap={vi.fn()}
      />,
    )
    const cell = screen.getByRole('button', { name: /String 1.*fret 5\b/i })
    expect(cell.className).toMatch(/\bw-full\b/)
    expect(cell.className).toMatch(/\bh-full\b/)
  })

  it('renders the grid as direct grid children (no display:contents row wrappers)', () => {
    render(
      <Fretboard
        maxFret={12}
        attempts={[]}
        referenceMarkersVisible={false}
        onTap={vi.fn()}
      />,
    )
    const board = screen.getByRole('grid', { name: /fretboard/i })
    // 6 strings × (1 string-number label + 13 fret columns) = 84 cells;
    // the grid should have exactly that many direct element children (or
    // those wrapped in a single per-cell container — but never a per-row
    // wrapper with display:contents).
    const childCount = board.children.length
    expect(childCount).toBe(84)
  })

  it('forwards onAudio down to every Fret, called with the fret position on click', async () => {
    const user = (await import('@testing-library/user-event')).default.setup()
    const onAudio = vi.fn()
    render(
      <Fretboard
        maxFret={12}
        attempts={[]}
        referenceMarkersVisible={false}
        onTap={vi.fn()}
        onAudio={onAudio}
      />,
    )
    // Tap low-E (string 6) fret 3
    await user.click(screen.getByRole('button', { name: /String 6.*fret 3\b/i }))
    expect(onAudio).toHaveBeenCalledTimes(1)
    expect(onAudio).toHaveBeenCalledWith({ string: 6, fret: 3 })
  })
})
