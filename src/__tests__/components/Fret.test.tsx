import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Fret } from '../../components/Fret'

describe('Fret', () => {
  it('calls both onAudio and onTap on click, with the same position', async () => {
    const user = userEvent.setup()
    const onTap = vi.fn()
    const onAudio = vi.fn()
    const pos = { string: 6, fret: 3 } as const
    render(
      <Fret
        position={pos}
        attempt={null}
        showReferenceMarker={false}
        onTap={onTap}
        onAudio={onAudio}
      />,
    )
    await user.click(screen.getByRole('button'))
    expect(onAudio).toHaveBeenCalledTimes(1)
    expect(onAudio).toHaveBeenCalledWith(pos)
    expect(onTap).toHaveBeenCalledTimes(1)
    expect(onTap).toHaveBeenCalledWith(pos)
  })

  it('still calls onTap when onAudio is omitted (the prop is optional; pre-004 behavior)', async () => {
    const user = userEvent.setup()
    const onTap = vi.fn()
    render(
      <Fret
        position={{ string: 1, fret: 12 }}
        attempt={null}
        showReferenceMarker={false}
        onTap={onTap}
      />,
    )
    await user.click(screen.getByRole('button'))
    expect(onTap).toHaveBeenCalledTimes(1)
  })

  it('renders the green/red attempt marker independently of the audio prop', () => {
    const { rerender } = render(
      <Fret
        position={{ string: 6, fret: 3 }}
        attempt="correct"
        showReferenceMarker={false}
        onTap={vi.fn()}
        onAudio={vi.fn()}
      />,
    )
    expect(screen.getByRole('button')).toHaveAttribute('data-attempt', 'correct')

    rerender(
      <Fret
        position={{ string: 6, fret: 3 }}
        attempt="incorrect"
        showReferenceMarker={false}
        onTap={vi.fn()}
        onAudio={vi.fn()}
      />,
    )
    expect(screen.getByRole('button')).toHaveAttribute('data-attempt', 'incorrect')
  })
})
