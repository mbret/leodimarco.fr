import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { Realisation } from '@/payload-types'

import { CallToActionBlock } from '@/blocks/CallToAction/Component'
import { ContentBlock } from '@/blocks/Content/Component'
import { FAQBlock } from '@/blocks/FAQ/Component'
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

describe('FAQ block', () => {
  const question = (text: string, extra: object = {}) => ({
    id: text,
    question: text,
    answer: richText(paragraph('Réponse.')),
    ...extra,
  })
  const category = (title: string, text: string) => ({ title, items: [question(text)] })
  const twoCategories = {
    blockType: 'faq' as const,
    categories: [
      {
        title: 'Est-ce adapté à mon cas ?',
        items: [question('À qui s’adresse la tricopigmentation ?', { id: 'q1' })],
      },
      category('Sécurité', 'Qu’en est-il de l’hygiène ?'),
    ],
  }

  // jsdom lays nothing out: elements start below the screen, then report the top the test gives
  const tops = new Map<string, number>()
  beforeEach(() => {
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
      this: HTMLElement,
    ) {
      const top = tops.get(this.id) ?? window.innerHeight
      return { top, bottom: top + 100 } as DOMRect
    })
  })
  afterEach(() => {
    tops.clear()
    vi.restoreAllMocks()
    window.history.replaceState(null, '', window.location.pathname)
  })
  const place = (id: string, top: number) => tops.set(id, top)
  // The page scrolled to its end
  const scrollToEnd = () => {
    vi.spyOn(window, 'scrollY', 'get').mockReturnValue(500)
    vi.spyOn(Element.prototype, 'scrollHeight', 'get').mockReturnValue(window.innerHeight + 500)
    fireEvent.scroll(window)
  }
  const navLinks = () =>
    within(screen.getByRole('navigation', { name: 'Catégories de questions' })).getAllByRole('link')
  const current = () =>
    navLinks()
      .filter((link) => link.getAttribute('aria-current') === 'location')
      .map((link) => link.getAttribute('href'))

  it('links to each category and marks the one being read', () => {
    render(React.createElement(FAQBlock, twoCategories))

    expect(navLinks().map((link) => link.getAttribute('href'))).toEqual([
      '#est-ce-adapte-a-mon-cas',
      '#securite',
    ])
    expect(current()).toEqual(['#est-ce-adapte-a-mon-cas'])
    expect(document.querySelector('#est-ce-adapte-a-mon-cas h2')!.textContent).toBe(
      'Est-ce adapté à mon cas\u00a0?',
    )

    // The second category's top passes 30% of the screen height
    place('est-ce-adapte-a-mon-cas', -400)
    place('securite', window.innerHeight * 0.2)
    fireEvent.scroll(window)
    expect(current()).toEqual(['#securite'])

    // Back up: the second category goes below 30% again
    place('est-ce-adapte-a-mon-cas', -100)
    place('securite', window.innerHeight * 0.5)
    fireEvent.scroll(window)
    expect(current()).toEqual(['#est-ce-adapte-a-mon-cas'])
  })

  it('marks the category already scrolled to when the page opens', () => {
    place('est-ce-adapte-a-mon-cas', -400)
    place('securite', 0)
    render(React.createElement(FAQBlock, twoCategories))

    expect(current()).toEqual(['#securite'])
  })

  it('marks the last category at the end of the page, however low it stays', () => {
    render(React.createElement(FAQBlock, twoCategories))
    place('est-ce-adapte-a-mon-cas', -400)
    place('securite', window.innerHeight * 0.6)
    scrollToEnd()

    expect(current()).toEqual(['#securite'])
  })

  it('marks the category of the question a link leads to at the end of the page', () => {
    render(React.createElement(FAQBlock, twoCategories))
    window.history.replaceState(null, '', '#question-q1')
    // The page cannot scroll the question to the top: it stays in the middle of the screen
    place('est-ce-adapte-a-mon-cas', window.innerHeight * 0.1)
    place('question-q1', window.innerHeight * 0.4)
    place('securite', window.innerHeight * 0.6)
    scrollToEnd()

    expect(current()).toEqual(['#est-ce-adapte-a-mon-cas'])
  })

  it('gives categories with the same title their own anchor', () => {
    render(
      React.createElement(FAQBlock, {
        blockType: 'faq',
        categories: [category('Tarifs', 'Combien ?'), category('Tarifs ?', 'Pourquoi ?')],
      }),
    )

    expect(navLinks().map((link) => link.getAttribute('href'))).toEqual(['#tarifs', '#tarifs-2'])
  })

  it('shows a single category without links to it, the question mark on its word', () => {
    render(
      React.createElement(FAQBlock, {
        blockType: 'faq',
        categories: [category('Questions fréquentes', 'Est-ce douloureux ?')],
      }),
    )

    expect(screen.queryByRole('navigation')).toBeNull()
    expect(screen.getByRole('heading', { level: 2, name: 'Questions fréquentes' })).toBeTruthy()
    expect(screen.getByRole('button').textContent).toBe('Est-ce douloureux\u00a0?')
  })

  it('links each highlighted question to its answer', () => {
    render(
      React.createElement(FAQBlock, {
        blockType: 'faq',
        highlightsTitle: 'Les questions les plus posées',
        categories: [
          {
            title: 'Déroulement',
            items: [
              question('Est-ce douloureux ?', {
                highlight: true,
                shortAnswer: '« Non » : très peu.',
              }),
            ],
          },
        ],
      }),
    )

    const link = screen.getByRole('link', { name: 'Lire la réponse' })
    const answer = document.getElementById(link.getAttribute('href')!.slice(1))
    expect(within(answer!).getByRole('button').textContent).toBe('Est-ce douloureux\u00a0?')
    expect(screen.getByText(/Non/).textContent).toBe('«\u00a0Non\u00a0»\u00a0: très peu.')
  })

  it('gives search engines the questions and answers as written', () => {
    const { container } = render(
      React.createElement(FAQBlock, {
        blockType: 'faq',
        categories: [
          {
            title: 'Questions fréquentes',
            items: [
              question('Est-ce douloureux ?', {
                answer: richText(paragraph('Très peu : une gêne légère.')),
              }),
            ],
          },
        ],
      }),
    )

    const script = container.querySelector('script[type="application/ld+json"]')
    const [entity] = JSON.parse(script!.textContent!).mainEntity
    expect(entity.name).toBe('Est-ce douloureux ?')
    expect(entity.acceptedAnswer.text).toBe('Très peu : une gêne légère.')
    // The page itself keeps the colon on the line of its word
    fireEvent.click(screen.getByRole('button', { name: /douloureux/ }))
    expect(screen.getByText(/gêne/).textContent).toBe('Très peu\u00a0: une gêne légère.')
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
  const realisation = (id: number, photos: Realisation['photos']): Realisation => ({
    id,
    title: 'Effet rasé',
    photos,
    createdAt: '2026-11-13T00:00:00.000Z',
    updatedAt: '2026-11-13T00:00:00.000Z',
  })

  it('shows a client’s first view, framed on its focal point, and a chip for each view', () => {
    render(
      React.createElement(GalleryGrid, {
        realisations: [
          realisation(1, [
            {
              id: 'a',
              view: 'troisQuarts',
              image: { ...photo(1, 'Trois quarts'), focalX: 50, focalY: 30 },
            },
            { id: 'b', view: 'face', image: photo(2, 'Face') },
            { id: 'c', view: 'dos', image: photo(3, 'Dos') },
          ]),
        ],
      }),
    )

    const card = within(screen.getByRole('group', { name: 'Effet rasé, réalisation 1 sur 1' }))
    expect(card.getAllByRole('img').map((img) => img.getAttribute('alt'))).toEqual([
      'Trois quarts',
      'Face',
      'Dos',
    ])
    expect(card.getByRole('img', { name: 'Trois quarts' }).style.objectPosition).toBe('50% 30%')
    const views = within(screen.getByRole('group', { name: 'Vues' }))
    expect(views.getAllByRole('button').map((chip) => chip.textContent)).toEqual([
      '3/4',
      'Face',
      'Dos',
    ])
    expect(views.getByRole('button', { name: '3/4' }).getAttribute('aria-pressed')).toBe('true')
  })

  // jsdom lays nothing out, so each test gives the strip the width of one view
  const renderTwoViews = () => {
    render(
      React.createElement(GalleryGrid, {
        realisations: [
          realisation(1, [
            { id: 'a', view: 'troisQuarts', image: photo(1, 'Trois quarts') },
            { id: 'b', view: 'dos', image: photo(2, 'Dos') },
          ]),
        ],
      }),
    )
    const strip = screen.getByRole('group', { name: 'Effet rasé, réalisation 1 sur 1' })
    Object.defineProperty(strip, 'clientWidth', { configurable: true, value: 400 })
    const pressed = () =>
      screen
        .getAllByRole('button')
        .filter((chip) => chip.getAttribute('aria-pressed') === 'true')
        .map((chip) => chip.textContent)
    return { pressed, strip }
  }

  it('scrolls to the view a chip names, and keeps that chip pressed on the way', () => {
    const { pressed, strip } = renderTwoViews()

    fireEvent.click(screen.getByRole('button', { name: 'Dos' }))

    expect(strip.scrollLeft).toBe(400)
    expect(pressed()).toEqual(['Dos'])
    // The smooth scroll first reports the view it leaves
    strip.scrollLeft = 120
    fireEvent.scroll(strip)
    expect(pressed()).toEqual(['Dos'])
  })

  it('presses the chip of the view a swipe shows', () => {
    const { pressed, strip } = renderTwoViews()

    strip.scrollLeft = 400
    fireEvent.scroll(strip)

    expect(pressed()).toEqual(['Dos'])
  })

  it('names the view of a client with a single photo', () => {
    render(
      React.createElement(GalleryGrid, {
        realisations: [
          realisation(1, [{ id: 'a', view: 'grosPlan', image: photo(1, 'Gros plan') }]),
        ],
      }),
    )

    expect(screen.getByText('Gros plan')).toBeTruthy()
    expect(screen.queryByRole('button')).toBeNull()
    expect(screen.getByRole('group').getAttribute('tabindex')).toBeNull()
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
