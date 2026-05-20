import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TrebleClef } from '../../components/TrebleClef'

describe('TrebleClef', () => {
  it('renders an SVG with role="img" and aria-label "treble clef"', () => {
    render(<TrebleClef />)
    const img = screen.getByRole('img', { name: /treble clef/i })
    expect(img).toBeInTheDocument()
    expect(img.tagName.toLowerCase()).toBe('svg')
  })

  it('applies a passed-in className to the SVG element', () => {
    render(<TrebleClef className="custom-class size-lg" />)
    const img = screen.getByRole('img', { name: /treble clef/i })
    expect(img.getAttribute('class') ?? '').toContain('custom-class')
  })
})
