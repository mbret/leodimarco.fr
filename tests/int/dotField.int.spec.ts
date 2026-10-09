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

  it('draws the patch at the end of the page', () => {
    const { container } = render(React.createElement(DotField, { variant: 'end' }))

    expect(container.querySelectorAll('.dot-field path').length).toBeGreaterThan(0)
  })

  it('pigments the dots in only once the drawing is on screen', () => {
    // jsdom has no IntersectionObserver: this one reports when the test says so
    let onScreen: IntersectionObserverCallback = () => {}
    const original = window.IntersectionObserver
    window.IntersectionObserver = class {
      constructor(callback: IntersectionObserverCallback) {
        onScreen = callback
      }
      observe() {}
      disconnect() {}
    } as unknown as typeof IntersectionObserver

    try {
      const field = render(React.createElement(DotField, { variant: 'end' })).container
        .firstElementChild as HTMLElement
      expect(field.style.getPropertyValue('--dot-fill')).toBe('0')

      const entry = { isIntersecting: true } as IntersectionObserverEntry
      onScreen([entry], { disconnect() {} } as IntersectionObserver)
      expect(field.style.getPropertyValue('--dot-fill')).toBe('1')
    } finally {
      window.IntersectionObserver = original
    }
  })
})
