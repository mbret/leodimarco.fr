import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import React from 'react'
import { afterEach, describe, expect, it } from 'vitest'

import { CallToActionBlock } from '@/blocks/CallToAction/Component'
import { ContentBlock } from '@/blocks/Content/Component'
import { GalleryGrid } from '@/blocks/Gallery/GalleryGrid'
import { TestimonialsBlock } from '@/blocks/Testimonials/Component'
import { heading, paragraph, richText } from '@/endpoints/seed/richText'
import { Media } from '@/components/Media'
import { MediumImpactHero } from '@/heros/MediumImpact'

const photo = (id: number, alt: string) => ({
  id,
  alt,
  url: `/api/media/file/photo-${id}.jpg`,
  width: 1200,
  height: 1500,
  createdAt: '2026-11-07T00:00:00.000Z',
  updatedAt: '2026-11-07T00:00:00.000Z',
})

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

describe('Content block', () => {
  it('shows a column’s image under its text', () => {
    render(
      React.createElement(ContentBlock, {
        blockType: 'content',
        columns: [
          { size: 'half', richText: richText(paragraph('Ma formation')) },
          {
            size: 'half',
            richText: richText(paragraph('Le studio')),
            media: photo(1, 'Le studio'),
          },
        ],
      }),
    )

    expect(screen.getByText('Ma formation')).toBeTruthy()
    expect(screen.getByRole('img', { name: 'Le studio' })).toBeTruthy()
    expect(screen.queryByRole('list', { name: 'Photos' })).toBeNull()
  })

  it('shows columns that each hold only an image as a row of photos', () => {
    render(
      React.createElement(ContentBlock, {
        blockType: 'content',
        columns: [1, 2, 3].map((id) => ({
          size: 'oneThird' as const,
          media: photo(id, `Photo ${id}`),
        })),
      }),
    )

    const row = screen.getByRole('list', { name: 'Photos' })
    expect(
      within(row)
        .getAllByRole('img')
        .map((img) => img.getAttribute('alt')),
    ).toEqual(['Photo 1', 'Photo 2', 'Photo 3'])
    expect(row.getAttribute('tabindex')).toBe('0')
  })

  it('keeps a single image in its column', () => {
    render(
      React.createElement(ContentBlock, {
        blockType: 'content',
        columns: [{ size: 'full', media: photo(1, 'Le studio') }],
      }),
    )

    expect(screen.getByRole('img', { name: 'Le studio' })).toBeTruthy()
    expect(screen.queryByRole('list', { name: 'Photos' })).toBeNull()
  })

  it('shows no image in a text column', () => {
    render(
      React.createElement(ContentBlock, {
        blockType: 'content',
        columns: [{ size: 'full', richText: richText(paragraph('Mon engagement')) }],
      }),
    )

    expect(screen.getByText('Mon engagement')).toBeTruthy()
    expect(screen.queryByRole('img')).toBeNull()
  })
})

describe('Call to action block', () => {
  const block = {
    blockType: 'cta' as const,
    richText: richText(paragraph('Envoyez-moi quelques photos.')),
  }

  it('shows the photo beside the text', () => {
    render(React.createElement(CallToActionBlock, { ...block, media: photo(6, 'Léo Di Marco') }))

    expect(screen.getByRole('img', { name: 'Léo Di Marco' })).toBeTruthy()
    expect(screen.getByText('Envoyez-moi quelques photos.')).toBeTruthy()
  })

  it('shows no photo without one', () => {
    render(React.createElement(CallToActionBlock, block))

    expect(screen.queryByRole('img')).toBeNull()
  })
})

describe('Green band hero', () => {
  it('shows the title beside the photo, framed on its focal point', () => {
    render(
      React.createElement(MediumImpactHero, {
        type: 'mediumImpact',
        richText: richText(heading('À propos de moi'), paragraph('Je m’appelle Léo Di Marco.')),
        media: { ...photo(1, 'Léo Di Marco dans son studio'), focalX: 38, focalY: 35 },
      }),
    )

    expect(screen.getByRole('heading', { level: 1, name: 'À propos de moi' })).toBeTruthy()
    const portrait = screen.getByRole('img', { name: 'Léo Di Marco dans son studio' })
    expect(portrait.style.objectPosition).toBe('38% 35%')
  })
})

describe('Gallery', () => {
  it('frames each result on its focal point and opens it full size', () => {
    render(
      React.createElement(GalleryGrid, {
        realisations: [
          {
            id: 1,
            title: 'Effet rasé, de face',
            image: { ...photo(1, 'Vue de face'), focalX: 50, focalY: 30 },
            createdAt: '2026-11-09T00:00:00.000Z',
            updatedAt: '2026-11-09T00:00:00.000Z',
          },
        ],
      }),
    )

    const tile = screen.getByRole('button', { name: /Effet rasé, de face/ })
    expect(within(tile).getByRole('img', { name: 'Vue de face' }).style.objectPosition).toBe(
      '50% 30%',
    )
    fireEvent.click(tile)
    expect(screen.getByRole('dialog', { name: 'Effet rasé, de face' })).toBeTruthy()
  })
})

describe('Media', () => {
  it('keeps an image shown whole centred, whatever its focal point', () => {
    render(
      React.createElement(Media, {
        fill: true,
        imgClassName: 'object-contain',
        resource: { ...photo(1, 'Avant'), focalX: 20, focalY: 50 },
      }),
    )

    expect(screen.getByRole('img', { name: 'Avant' }).style.objectPosition).toBe('')
  })
})
