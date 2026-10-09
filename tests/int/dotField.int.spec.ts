import { cleanup, render } from '@testing-library/react'
import React from 'react'
import { afterEach, beforeAll, describe, expect, it } from 'vitest'

import { LowImpactHero } from '@/heros/LowImpact'

beforeAll(() => {
  // jsdom has no matchMedia: answer like a visitor who reduces motion, so the field stays still
  window.matchMedia = (query: string) => ({ matches: true, media: query }) as MediaQueryList
})

afterEach(cleanup)

describe('Dot pattern', () => {
  it('shows beside the title only when the header turns it on', () => {
    const { container } = render(
      React.createElement(LowImpactHero, { type: 'lowImpact', dotPattern: true }),
    )
    const field = container.querySelector('.dot-field')

    expect(field?.getAttribute('aria-hidden')).toBe('true')
    expect(field?.querySelectorAll('path').length).toBeGreaterThan(0)

    cleanup()
    const { container: plain } = render(React.createElement(LowImpactHero, { type: 'lowImpact' }))
    expect(plain.querySelector('.dot-field')).toBeNull()
  })
})
