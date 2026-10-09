import { cleanup, render, screen, within } from '@testing-library/react'
import React from 'react'
import { afterEach, describe, expect, it } from 'vitest'

import type { Page } from '@/payload-types'

import { Breadcrumbs } from '@/components/Breadcrumbs'
import { pagePath } from '@/utilities/pagePath'

afterEach(cleanup)

const effetRase: Page['breadcrumbs'] = [
  { url: '/prestations', label: 'Prestations' },
  { url: '/prestations/effet-rase', label: 'Effet rasé' },
]

describe('Nested pages', () => {
  it('builds page paths from the breadcrumbs', () => {
    expect(pagePath({ slug: 'home' })).toBe('/')
    expect(pagePath({ slug: 'contact' })).toBe('/contact')
    expect(pagePath({ slug: 'effet-rase', breadcrumbs: effetRase })).toBe('/prestations/effet-rase')
  })

  it('shows the parent pages above the title of a nested page', () => {
    const { container } = render(React.createElement(Breadcrumbs, { breadcrumbs: effetRase }))

    const trail = screen.getByRole('navigation', { name: 'Fil d’Ariane' })
    expect(within(trail).getByRole('link', { name: 'Prestations' }).getAttribute('href')).toBe(
      '/prestations',
    )
    expect(within(trail).getByText('Effet rasé').getAttribute('aria-current')).toBe('page')

    const data = JSON.parse(
      container.querySelector('script[type="application/ld+json"]')?.textContent || '{}',
    )
    expect(data['@type']).toBe('BreadcrumbList')
    expect(data.itemListElement.map((item: { name: string }) => item.name)).toEqual([
      'Prestations',
      'Effet rasé',
    ])
  })

  it('shows no trail on top level pages', () => {
    const { container } = render(
      React.createElement(Breadcrumbs, { breadcrumbs: [{ url: '/contact', label: 'Contact' }] }),
    )

    expect(container.innerHTML).toBe('')
  })
})
