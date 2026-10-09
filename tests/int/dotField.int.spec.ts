import { cleanup, render } from '@testing-library/react'
import React from 'react'
import { afterEach, beforeAll, describe, expect, it } from 'vitest'

import { DotField, randomDots } from '@/components/DotField'
import { LowImpactHero } from '@/heros/LowImpact'

beforeAll(() => {
  // jsdom has no matchMedia: answer like a visitor who reduces motion, so the dots stay still
  window.matchMedia = (query: string) => ({ matches: true, media: query }) as MediaQueryList
})

afterEach(cleanup)

const renderHero = (dotPattern?: boolean) =>
  render(React.createElement(LowImpactHero, { type: 'lowImpact', dotPattern })).container

// The dots of a rendered drawing, as their paths
const paths = (container: HTMLElement) =>
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
    const first = paths(renderHero(true))
    cleanup()

    expect(first).not.toBe('')
    expect(paths(renderHero(true))).not.toBe(first)
  })

  it('keeps clear of the text', () => {
    const title = { left: 300, right: 500, top: 60, bottom: 120 }
    const dots = randomDots('hero', 560, 240, [title])
      .flatMap(({ d }) => [...d.matchAll(/M(\d+) (\d+)/g)])
      .map(([, x, y]) => ({ x: Number(x), y: Number(y) }))

    expect(dots.length).toBeGreaterThan(0)
    // Within 8 pixels of the text there are no dots, allowing for the rounding of positions
    const near = dots.filter(
      ({ x, y }) =>
        x > title.left - 7 && x < title.right + 7 && y > title.top - 7 && y < title.bottom + 7,
    )
    expect(near).toEqual([])
  })

  it('draws the footer band', () => {
    const { container } = render(React.createElement(DotField, { variant: 'band' }))

    expect(container.querySelectorAll('.dot-field path').length).toBeGreaterThan(0)
  })
})
