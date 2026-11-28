import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { Realisation } from '@/payload-types'

import { CallToActionBlock } from '@/blocks/CallToAction/Component'
import { ContentBlock } from '@/blocks/Content/Component'
import { FAQBlock } from '@/blocks/FAQ/Component'
import { GalleryGrid } from '@/blocks/Gallery/GalleryGrid'
import { ServicesBlock } from '@/blocks/Services/Component'
import { StepsBlock } from '@/blocks/Steps/Component'
import { TestimonialsBlock } from '@/blocks/Testimonials/Component'
import { heading, paragraph, richText } from '@/endpoints/seed/richText'
import { Media } from '@/components/Media'
import { MediumImpactHero } from '@/heros/MediumImpact'
import { PhotoHero } from '@/heros/Photo'

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

  it('shows the full stop that ends its title in green', () => {
    render(React.createElement(TestimonialsBlock, { ...block, heading: 'Mes clients témoignent.' }))

    const title = screen.getByRole('heading', { level: 2, name: 'Mes clients témoignent.' })
    expect(title.querySelector('.text-full-stop')?.textContent).toBe('.')
  })

  it('shows the first review in large type, beside the others', () => {
    render(
      React.createElement(TestimonialsBlock, {
        ...block,
        layout: 'featured',
        reviews: [
          { id: '1', rating: 5, text: 'Super naturel.', author: 'ily an' },
          { id: '2', rating: 5, text: 'Très bien géré.', author: 'Théo M.' },
        ],
      }),
    )

    const [first, ...others] = document.querySelectorAll('figure')
    expect(first.querySelector('blockquote')?.textContent).toBe('«\u00a0Super naturel.\u00a0»')
    expect(first.closest('li')).toBeNull()
    expect(others.map((review) => review.querySelector('blockquote')?.textContent)).toEqual([
      '«\u00a0Très bien géré.\u00a0»',
    ])
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

describe('Services block', () => {
  const service = (title: string, extra: object = {}) => ({
    id: title,
    title,
    description: 'Description.',
    enableLink: true,
    link: { type: 'custom' as const, url: `/prestations/${title}`, label: `Découvrir ${title}` },
    ...extra,
  })

  const items = [
    service('camouflage', { illustration: 'scar' }),
    service('rase', { illustration: 'shaved' }),
  ]

  it('shows each service as a tile with its drawing, whose link covers it', () => {
    const { container } = render(
      React.createElement(ServicesBlock, {
        blockType: 'services',
        heading: 'Trois effets.',
        layout: 'drawings',
        enableLink: true,
        link: { type: 'custom', url: '/prestations', label: 'Toutes les prestations →' },
        items,
      }),
    )

    expect(screen.getByRole('link', { name: 'Toutes les prestations →' })).toBeTruthy()
    expect(container.querySelector('[data-slot="card"]')).toBeNull()
    const tileLink = screen.getByRole('link', { name: 'Découvrir camouflage' })
    expect(tileLink.className).toContain('after:inset-0')
    const tile = tileLink.closest('div')!
    // The scar's dots sit in their own paths, which fill the scar one after the other, in a loop
    const scar = [...tile.querySelectorAll<SVGPathElement>('svg[aria-hidden] path.scar-dots')]
    expect(scar.length).toBeGreaterThan(1)
    expect(scar.map((path) => path.style.animationDelay)).toEqual(
      scar.map((_, i) => (i ? `${i * 150}ms` : '')),
    )
  })

  it('shows each service as a card without its drawing by default', () => {
    const { container } = render(
      React.createElement(ServicesBlock, { blockType: 'services', items }),
    )

    expect(container.querySelectorAll('[data-slot="card"]')).toHaveLength(2)
    expect(container.querySelector('svg')).toBeNull()
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

  it('spans the screen on a green band, with its photo beside the text', () => {
    const { container } = render(
      React.createElement(CallToActionBlock, {
        ...block,
        style: 'band',
        media: photo(6, 'Léo Di Marco dans son studio'),
      }),
    )

    expect(container.querySelector('.studio-band')).toBeTruthy()
    expect(container.querySelector('.bg-card')).toBeNull()
    expect(screen.getByRole('img', { name: 'Léo Di Marco dans son studio' })).toBeTruthy()
    expect(screen.getByText('Envoyez-moi quelques photos.')).toBeTruthy()
    expect(container.querySelector('.dot-field')).toBeNull()
  })

  it('shows dots on the right of a band without a photo', () => {
    // jsdom has no layout: the text the dots keep clear of has no boxes
    const original = Range.prototype.getClientRects
    Range.prototype.getClientRects = () => [] as unknown as DOMRectList

    try {
      const { container } = render(
        React.createElement(CallToActionBlock, { ...block, style: 'band' }),
      )

      const field = container.querySelector('.dot-field-band')
      expect(field?.getAttribute('aria-hidden')).toBe('true')
      expect(field?.querySelectorAll('path').length).toBeGreaterThan(0)
      expect(field?.querySelector('svg')?.getAttribute('class')).toContain('right-0')
    } finally {
      Range.prototype.getClientRects = original
    }
  })

  it('shows the facts of a band under its text', () => {
    render(
      React.createElement(CallToActionBlock, {
        ...block,
        style: 'band',
        media: photo(6, 'Léo Di Marco dans son studio'),
        facts: [{ id: '1', value: '29 ans', label: 'L’âge de ma propre tricopigmentation' }],
      }),
    )

    const fact = screen.getByText('29 ans').closest('li')!
    expect(within(fact).getByText('L’âge de ma propre tricopigmentation')).toBeTruthy()
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

describe('Photo hero', () => {
  it('shows the page title as a label, the large subtitle, the photo and the short facts', () => {
    const { container } = render(
      React.createElement(PhotoHero, {
        type: 'photo',
        richText: richText(
          heading('Tricopigmentation à Nancy.'),
          heading('**Un résultat qui se voit.**', 'h2'),
        ),
        media: photo(2, 'Effet rasé cicatrisé'),
        highlights: [{ id: '1', text: 'Formé à la Médicoderm Académie' }],
      }),
    )

    expect(
      screen.getByRole('heading', { level: 1, name: 'Tricopigmentation à Nancy.' }),
    ).toBeTruthy()
    expect(container.querySelector('.photo-hero h1 + h2 strong')?.textContent).toBe(
      'Un résultat qui se voit',
    )
    expect(screen.getByRole('img', { name: 'Effet rasé cicatrisé' })).toBeTruthy()
    expect(screen.getByText('Formé à la Médicoderm Académie')).toBeTruthy()
  })

  it('shows the photo at the shape it was uploaded or cropped to', () => {
    render(
      React.createElement(PhotoHero, {
        type: 'photo',
        richText: richText(heading('Tricopigmentation à Nancy.')),
        media: { ...photo(3, 'Ligne frontale'), width: 960, height: 640 },
      }),
    )

    const img = screen.getByRole('img', { name: 'Ligne frontale' })
    expect([img.getAttribute('width'), img.getAttribute('height')]).toEqual(['960', '640'])
    expect(img.style.position).not.toBe('absolute')
  })
})

describe('Steps block', () => {
  it('lists the steps in order, each with its label', () => {
    render(
      React.createElement(StepsBlock, {
        blockType: 'steps',
        heading: 'De vos photos au résultat cicatrisé.',
        items: [
          { id: '1', label: 'Aujourd’hui', title: 'Vous m’envoyez quelques photos' },
          { id: '2', label: 'Au studio', title: 'Je prépare votre projet', text: 'La forme.' },
        ],
      }),
    )

    const steps = within(screen.getByRole('list')).getAllByRole('listitem')
    expect(steps.map((step) => step.querySelector('h3')?.textContent)).toEqual([
      'Vous m’envoyez quelques photos',
      'Je prépare votre projet',
    ])
    expect(within(steps[1]).getByText('Au studio')).toBeTruthy()
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

  it('loads smaller photos in a row of four than in cards', () => {
    const sizes = (layout?: 'cards' | 'row') => {
      const { container, unmount } = render(
        React.createElement(GalleryGrid, {
          layout,
          realisations: [realisation(1, [{ id: 'a', view: 'face', image: photo(1, 'Face') }])],
        }),
      )
      const value = container.querySelector('img')?.getAttribute('sizes')
      unmount()
      return value
    }

    expect(sizes('row')).toBe('(max-width: 1024px) 50vw, 240px')
    expect(sizes()).toBe('(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 480px')
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
    expect(screen.queryByRole('group', { name: 'Vues' })).toBeNull()
    expect(screen.getByRole('group').getAttribute('tabindex')).toBeNull()
  })

  describe('viewer', () => {
    const renderClient = () =>
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
    const viewer = () => within(screen.getByRole('dialog', { name: 'Effet rasé' }))

    it('opens the full-size photo the card shows, from the photo or its button', () => {
      renderClient()

      fireEvent.click(screen.getByRole('img', { name: 'Trois quarts' }))

      expect(
        viewer().getAllByRole('img', { name: 'Trois quarts' }).at(-1)?.getAttribute('src'),
      ).toMatch(/^\/api\/media\/file\/photo-1\.jpg\?/)
      fireEvent.click(viewer().getByRole('button', { name: 'Fermer' }))
      expect(screen.queryByRole('dialog')).toBeNull()

      fireEvent.click(screen.getByRole('button', { name: 'Agrandir les photos' }))
      expect(screen.getByRole('dialog', { name: 'Effet rasé' })).toBeTruthy()
    })

    it('changes view with its chips, and leaves the card on the last view shown', () => {
      renderClient()
      fireEvent.click(screen.getByRole('button', { name: 'Agrandir les photos' }))

      fireEvent.click(viewer().getByRole('button', { name: 'Dos' }))
      expect(viewer().getByRole('img', { name: 'Dos' }).getAttribute('src')).toMatch(/photo-2\.jpg/)
      fireEvent.keyDown(window, { key: 'Escape' })

      expect(screen.queryByRole('dialog')).toBeNull()
      const cardChips = within(screen.getByRole('group', { name: 'Vues' }))
      expect(cardChips.getByRole('button', { name: 'Dos' }).getAttribute('aria-pressed')).toBe(
        'true',
      )
    })

    it('keeps Tab among its buttons', () => {
      renderClient()
      fireEvent.click(screen.getByRole('button', { name: 'Agrandir les photos' }))
      const buttons = viewer().getAllByRole('button')

      expect(document.activeElement).toBe(buttons[0])
      buttons.at(-1)?.focus()
      fireEvent.keyDown(window, { key: 'Tab' })
      expect(document.activeElement).toBe(buttons[0])
      fireEvent.keyDown(window, { key: 'Tab', shiftKey: true })
      expect(document.activeElement).toBe(buttons.at(-1))
    })

    it('stops the page from scrolling while it is open', () => {
      renderClient()

      fireEvent.click(screen.getByRole('button', { name: 'Agrandir les photos' }))
      expect(document.documentElement.style.overflow).toBe('hidden')
      fireEvent.click(viewer().getByRole('button', { name: 'Fermer' }))
      expect(document.documentElement.style.overflow).toBe('')
    })
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
