import { describe, expect, it } from 'vitest'

import type { Page } from '@/payload-types'

import { homePageData, type HomePhotos } from '@/endpoints/seed/home'
import { toPlainText } from '@/utilities/toPlainText'

const page = (id: number, slug: string) => ({ id, slug, title: slug }) as Page
const pages = {
  aPropos: page(1, 'a-propos'),
  contact: page(2, 'contact'),
  faq: page(3, 'faq'),
  galerie: page(4, 'galerie'),
}
const services = {
  effetRase: page(5, 'effet-rase'),
  densification: page(6, 'densification-capillaire'),
  camouflage: page(7, 'camouflage-de-cicatrices'),
}
const photos: HomePhotos = { hero: 11, technique: 12, story: 13 }

type PageData = ReturnType<typeof homePageData>
type Block = PageData['layout'][number]

const blockText = (block: Block) => {
  if (block.blockType === 'content')
    return (block.columns || [])
      .map(({ richText }) => toPlainText(richText))
      .filter(Boolean)
      .join('\n')
  if (block.blockType === 'cta') return toPlainText(block.richText)
  if (block.blockType === 'services')
    return block.items.map(({ title, description }) => `${title} ${description}`).join('\n')
  if (block.blockType === 'gallery') return block.heading ?? ''
  return ''
}

const pageText = ({ hero, layout }: PageData) =>
  [toPlainText(hero.richText), ...layout.map(blockText)].filter(Boolean).join('\n')

describe('Home page', () => {
  it('has the same text with or without photos', () => {
    const text = pageText(homePageData({ ...pages, services }))

    expect(pageText(homePageData({ ...pages, services, photos }))).toBe(text)
    expect(text).toContain('Une bonne tricopigmentation ne se remarque pas.')
    expect(text).toContain('Avant de pratiquer cette technique, j’y ai moi-même eu recours.')
  })

  it('puts a healed result beside the title, the close-up beside the technique and Léo on a green band', () => {
    const { hero, layout } = homePageData({ ...pages, services, photos })

    expect(hero).toMatchObject({ type: 'photo', media: photos.hero })
    expect(hero.highlights).toHaveLength(3)
    expect(layout[0]).toMatchObject({
      blockType: 'content',
      columns: [{ size: 'half' }, { size: 'half', media: photos.technique }],
    })
    expect(layout.find((block) => blockText(block).startsWith('Avant de pratiquer'))).toMatchObject(
      {
        blockType: 'cta',
        style: 'band',
        media: photos.story,
        facts: [{ value: '29 ans' }, { value: 'Médicoderm Académie' }, { value: 'Pompey' }],
      },
    )
  })

  it('shows four results, the steps and one featured review', () => {
    const { layout } = homePageData({ ...pages, services, photos })

    expect(layout.find((block) => block.blockType === 'gallery')).toMatchObject({
      layout: 'row',
      limit: 4,
      enableLink: true,
      link: { reference: { value: pages.galerie.id } },
    })
    const steps = layout.find((block) => block.blockType === 'steps')
    expect(steps?.items.map(({ label }) => label)).toEqual([
      'Aujourd’hui',
      'Au studio',
      'Trois séances',
      'Après cicatrisation',
    ])
    const reviews = layout.find((block) => block.blockType === 'testimonials')
    expect(reviews?.layout).toBe('featured')
    expect(reviews?.reviews?.map(({ author, excerpt }) => [author, Boolean(excerpt)])).toEqual([
      ['ily an', true],
      ['Théo M.', true],
      ['Mathieu', true],
    ])
  })

  it('keeps the dots and has no photo on a new site', () => {
    const { hero, layout } = homePageData({ ...pages, services })

    expect(hero).toMatchObject({ type: 'lowImpact', dotPattern: true })
    expect(hero.media).toBeUndefined()
    expect(JSON.stringify(layout)).not.toContain('"media"')
  })

  it('gives each effect card a button to its service page', () => {
    const { layout } = homePageData({ ...pages, services, photos })
    const effects = layout.find((block) => block.blockType === 'services')

    expect(
      effects?.items.map(({ enableLink, link }) => [enableLink, link?.reference?.value]),
    ).toEqual([
      [true, services.effetRase.id],
      [true, services.densification.id],
      [true, services.camouflage.id],
    ])
  })

  it('draws each effect, under a title that links to all the services', () => {
    const prestations = page(8, 'prestations')
    const { layout } = homePageData({ ...pages, prestations, services, photos })
    const effects = layout.find((block) => block.blockType === 'services')

    expect(effects?.items.map(({ illustration }) => illustration)).toEqual([
      'shaved',
      'density',
      'scar',
    ])
    expect(effects).toMatchObject({
      heading: 'Trois effets.',
      enableLink: true,
      link: { reference: { value: prestations.id } },
    })
  })

  it('ends on a green band that asks for photos, WhatsApp first', () => {
    const last = homePageData({ ...pages, services, photos }).layout.at(-1)

    expect(last).toMatchObject({ blockType: 'cta', style: 'band' })
    expect(last?.blockType === 'cta' && last.links?.map(({ link }) => link.label)).toEqual([
      'WhatsApp',
      'Instagram',
      'Me contacter',
    ])
  })
})
