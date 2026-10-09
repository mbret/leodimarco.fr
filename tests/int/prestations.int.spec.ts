import { cleanup, render, screen } from '@testing-library/react'
import React from 'react'
import { afterEach, describe, expect, it } from 'vitest'

import type { ContentBlock, Page } from '@/payload-types'

import { ServicesBlock } from '@/blocks/Services/Component'
import RichText from '@/components/RichText'
import { paragraph, richText, table } from '@/endpoints/seed/richText'

// Rich text as the blocks receive it from Payload
type RichTextData = NonNullable<NonNullable<ContentBlock['columns']>[number]['richText']>
const content = (...nodes: Parameters<typeof richText>): RichTextData => richText(...nodes)

afterEach(cleanup)

describe('Service pages', () => {
  it('renders tables with column headings and row labels', () => {
    render(
      React.createElement(RichText, {
        data: content(
          table({
            head: ['Style de rendu', 'Objectif'],
            rows: [['Très fondu', 'Résultat discret, peu marqué']],
          }),
        ),
      }),
    )

    expect(screen.getByRole('columnheader', { name: 'Objectif' })).toBeTruthy()
    expect(screen.getByRole('rowheader', { name: 'Très fondu' })).toBeTruthy()
    expect(screen.getByRole('cell', { name: 'Résultat discret, peu marqué' })).toBeTruthy()
  })

  it('keeps the footnote mark of a bold price', () => {
    render(React.createElement(RichText, { data: content(paragraph('**À partir de 200 €***')) }))

    expect(screen.getByText('À partir de 200 €').tagName).toBe('STRONG')
    expect(screen.getByRole('paragraph').textContent).toBe('À partir de 200 €*')
  })

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
