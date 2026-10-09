import { cleanup, render, screen } from '@testing-library/react'
import React from 'react'
import { afterEach, describe, expect, it } from 'vitest'

import type { Page } from '@/payload-types'

import { ServicesBlock } from '@/blocks/Services/Component'

afterEach(cleanup)

describe('Prestations', () => {
  it('links a service card to its page', () => {
    const page = { id: 1, slug: 'effet-rase' } as Page

    render(
      React.createElement(ServicesBlock, {
        blockType: 'services',
        items: [
          {
            id: '1',
            title: 'Effet rasé',
            enableLink: true,
            link: {
              type: 'reference',
              reference: { relationTo: 'pages', value: page },
              label: 'Découvrir l’effet rasé',
            },
          },
        ],
      }),
    )

    expect(screen.getByRole('link', { name: 'Découvrir l’effet rasé' }).getAttribute('href')).toBe(
      '/effet-rase',
    )
  })
})
