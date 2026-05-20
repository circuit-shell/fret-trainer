import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FretIndicatorBar } from '../../components/FretIndicatorBar'

describe('FretIndicatorBar', () => {
  it('renders one column per fret (0..maxFret) when visible=true', () => {
    render(<FretIndicatorBar maxFret={12} visible />)
    const bar = screen.getByTestId('fret-indicator-bar')
    const labels = bar.querySelectorAll('[data-fret-number]')
    expect(labels.length).toBe(13)
    const numbers = Array.from(labels).map((el) => el.getAttribute('data-fret-number'))
    expect(numbers).toEqual(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'])
  })

  it('does not render a visible "0" in the open-string column', () => {
    render(<FretIndicatorBar maxFret={12} visible />)
    const fret0 = document.querySelector('[data-fret-number="0"]')
    expect(fret0?.textContent ?? '').toBe('')
  })

  it('renders the actual fret number for frets 1..maxFret', () => {
    render(<FretIndicatorBar maxFret={12} visible />)
    for (let f = 1; f <= 12; f++) {
      const el = document.querySelector(`[data-fret-number="${f}"]`)
      expect(el?.textContent ?? '').toBe(String(f))
    }
  })

  it('renders nothing when visible=false', () => {
    const { container } = render(<FretIndicatorBar maxFret={12} visible={false} />)
    expect(container.firstChild).toBeNull()
  })

  it('the bar has presentation role and is aria-hidden (decorative)', () => {
    render(<FretIndicatorBar maxFret={12} visible />)
    const bar = screen.getByTestId('fret-indicator-bar')
    expect(bar).toHaveAttribute('aria-hidden', 'true')
    expect(bar.getAttribute('role')).toBe('presentation')
  })
})
