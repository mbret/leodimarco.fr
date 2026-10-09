import { cleanup, render } from '@testing-library/react'
import React from 'react'
import { afterEach, beforeAll, describe, expect, it } from 'vitest'

import { LowImpactHero } from '@/heros/LowImpact'

beforeAll(() => {
  // jsdom has no matchMedia: answer like a visitor who reduces motion, so the field stays still
  window.matchMedia = (query: string) => ({ matches: true, media: query }) as MediaQueryList
})

afterEach(cleanup)

const renderHero = (dotPattern?: boolean) =>
  render(React.createElement(LowImpactHero, { type: 'lowImpact', dotPattern })).container

// The dots of a rendered field, as their paths
const dots = (container: HTMLElement) =>
  [...container.querySelectorAll('.dot-field path')].map((path) => path.getAttribute('d')).join('')

describe('Dot pattern', () => {
  it('shows beside the title only when the header turns it on', () => {
    const field = renderHero(true).querySelector('.dot-field')

    expect(field?.getAttribute('aria-hidden')).toBe('true')
    expect(field?.querySelectorAll('path').length).toBeGreaterThan(0)

    cleanup()
    expect(renderHero().querySelector('.dot-field')).toBeNull()
  })

  it('draws a new patch every time', () => {
    const first = dots(renderHero(true))
    cleanup()

    expect(first).not.toBe('')
    expect(dots(renderHero(true))).not.toBe(first)
  })
})
