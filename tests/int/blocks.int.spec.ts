import { cleanup, render, screen } from '@testing-library/react'
import React from 'react'
import { afterEach, describe, expect, it } from 'vitest'

import { TestimonialsBlock } from '@/blocks/Testimonials/Component'
import { paragraph } from '@/endpoints/seed/richText'

afterEach(cleanup)

describe('Testimonials block', () => {
  const block = {
    blockType: 'testimonials' as const,
    heading: 'Mes clients témoignent',
    enableLink: true,
    link: { type: 'custom' as const, url: 'https://example.com/avis', label: 'Voir tous les avis' },
  }

  it('stays hidden without reviews or a link', () => {
    const { container } = render(
      React.createElement(TestimonialsBlock, { ...block, enableLink: false }),
    )

    expect(container.innerHTML).toBe('')
  })

  it('shows the link while there are no reviews yet', () => {
    render(React.createElement(TestimonialsBlock, block))

    expect(screen.getByRole('heading', { level: 2, name: 'Mes clients témoignent' })).toBeTruthy()
    expect(screen.queryByRole('list')).toBeNull()
    expect(screen.getByRole('link', { name: 'Voir tous les avis' }).getAttribute('href')).toBe(
      'https://example.com/avis',
    )
  })

  it('shows each review with its rating', () => {
    render(
      React.createElement(TestimonialsBlock, {
        ...block,
        reviews: [{ id: '1', rating: 4, text: 'Très bon accueil.', author: 'Marc' }],
      }),
    )

    expect(screen.getByRole('img', { name: 'Note : 4 sur 5' })).toBeTruthy()
    expect(screen.getByText('Très bon accueil.')).toBeTruthy()
    expect(screen.getByText('Marc')).toBeTruthy()
  })

  it('shows the client’s photo, or their initial without one', () => {
    render(
      React.createElement(TestimonialsBlock, {
        ...block,
        reviews: [
          { id: '1', rating: 5, text: 'Parfait.', author: 'ily an' },
          {
            id: '2',
            rating: 5,
            text: 'Très professionnel.',
            author: 'Théo M.',
            photo: {
              id: 1,
              alt: 'Photo de Théo',
              url: '/api/media/file/theo.webp',
              width: 500,
              height: 500,
              createdAt: '2026-10-19T00:00:00.000Z',
              updatedAt: '2026-10-19T00:00:00.000Z',
            },
          },
        ],
      }),
    )

    expect(screen.getByText('I')).toBeTruthy()
    expect(screen.getByRole('img', { name: 'Photo de Théo' })).toBeTruthy()
    expect(screen.queryByText('T')).toBeNull()
  })
})

describe('Seed rich text', () => {
  it('turns **text** into bold and newlines into line breaks', () => {
    const { children } = paragraph('**Un résultat qui se voit.**\nUne technique.')

    expect(children).toMatchObject([
      { type: 'text', text: 'Un résultat qui se voit.', format: 1 },
      { type: 'linebreak' },
      { type: 'text', text: 'Une technique.', format: 0 },
    ])
  })
})
