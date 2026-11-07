import { describe, expect, it } from 'vitest'

import type { Page } from '@/payload-types'

import { aProposPageData, type AProposPhotos } from '@/endpoints/seed/aPropos'
import { toPlainText } from '@/utilities/toPlainText'

const contact = { id: 9, slug: 'contact', title: 'Contact' } as Page
const photos: AProposPhotos = { hero: 1, training: 2, studio: [3, 4, 5], contactCard: 6 }

type PageData = ReturnType<typeof aProposPageData>
type Block = PageData['layout'][number]

const blockText = (block: Block) => {
  if (block.blockType === 'keyFacts')
    return (block.items || []).map(({ value, label }) => `${value} ${label}`).join('\n')
  if (block.blockType === 'content')
    return (block.columns || [])
      .map(({ richText }) => toPlainText(richText))
      .filter(Boolean)
      .join('\n')
  if (block.blockType === 'cta') return toPlainText(block.richText)
  return ''
}

const pageText = ({ hero, layout }: PageData) =>
  [toPlainText(hero.richText), ...layout.map(blockText)].filter(Boolean).join('\n')

describe('À propos page', () => {
  it('has the same text with or without photos', () => {
    const text = pageText(aProposPageData({ contact }))

    expect(pageText(aProposPageData({ contact, photos }))).toBe(text)
    expect(text).toContain('Ma formation')
    expect(text).toContain('Des pigments conformes à la réglementation européenne en vigueur')
  })

  it('puts the photos beside the title and the training, after the studio and on the contact card', () => {
    const { hero, layout } = aProposPageData({ contact, photos })
    const startsWith = (title: string) => (block: Block) => blockText(block).startsWith(title)

    expect(hero).toMatchObject({ type: 'mediumImpact', media: photos.hero })
    expect(layout.find(startsWith('Ma formation'))).toMatchObject({
      columns: [{ size: 'half' }, { size: 'half', media: photos.training }],
    })
    expect(layout[layout.findIndex(startsWith('Le studio')) + 1]).toEqual({
      blockType: 'content',
      columns: photos.studio.map((media) => ({ size: 'oneThird', media })),
    })
    expect(layout.at(-1)).toMatchObject({ blockType: 'cta', media: photos.contactCard })
  })

  it('keeps the dots beside the title and has no photo on a new site', () => {
    const { hero, layout } = aProposPageData({ contact })

    expect(hero).toMatchObject({ type: 'lowImpact', dotPattern: true })
    expect(hero.media).toBeUndefined()
    expect(JSON.stringify(layout)).not.toContain('"media"')
  })
})
