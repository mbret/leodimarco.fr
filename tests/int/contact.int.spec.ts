import { describe, expect, it } from 'vitest'

import { type ContactPhotos, contactPageData } from '@/endpoints/seed/contact'
import { toPlainText } from '@/utilities/toPlainText'

const contactForm = 4
const photos: ContactPhotos = { hero: 1, contactCard: 2, views: [3, 5, 6], studio: 7 }

type PageData = ReturnType<typeof contactPageData>
type Block = PageData['layout'][number]

const blockText = (block: Block) => {
  if (block.blockType === 'content')
    return (block.columns || [])
      .map(({ richText }) => toPlainText(richText))
      .filter(Boolean)
      .join('\n')
  if (block.blockType === 'cta') return toPlainText(block.richText)
  if (block.blockType === 'formBlock') return toPlainText(block.introContent)
  return ''
}

const pageText = ({ hero, layout }: PageData) =>
  [toPlainText(hero.richText), ...layout.map(blockText)].filter(Boolean).join('\n')

describe('Contact page', () => {
  it('has the same text with or without photos', () => {
    const text = pageText(contactPageData({ contactForm }))

    expect(pageText(contactPageData({ contactForm, photos }))).toBe(text)
    expect(text).toContain('Les photos à m’envoyer')
    expect(text).toContain('Vous préférez écrire ?')
    expect(text).toContain('Sur rendez-vous uniquement.')
  })

  it('offers WhatsApp and a call beside the title, and the form', () => {
    for (const page of [
      contactPageData({ contactForm }),
      contactPageData({ contactForm, photos }),
    ]) {
      expect(page.hero.links).toEqual([
        { link: expect.objectContaining({ url: 'https://wa.me/33744429488', newTab: true }) },
        { link: expect.objectContaining({ url: 'tel:+33744429488', label: '07 44 42 94 88' }) },
      ])
      expect(page.hero.links?.[1]?.link.newTab).toBeFalsy()
      expect(page.layout).toContainEqual(
        expect.objectContaining({ blockType: 'formBlock', form: contactForm }),
      )
    }
  })

  it('puts the photos beside the title, on the card, in a row after it and beside the address', () => {
    const { hero, layout } = contactPageData({ contactForm, photos })

    expect(hero).toMatchObject({ type: 'mediumImpact', media: photos.hero })
    expect(layout[0]).toMatchObject({ blockType: 'cta', media: photos.contactCard })
    expect(layout[1]).toEqual({
      blockType: 'content',
      columns: photos.views.map((media) => ({ size: 'oneThird', media })),
    })
    expect(layout.at(-1)).toMatchObject({
      blockType: 'content',
      columns: [
        {
          size: 'half',
          enableLink: true,
          link: {
            url: 'https://www.google.com/maps/dir/?api=1&destination=74%20rue%20des%20Jardins%20Fleuris%2C%2054340%20Pompey',
            newTab: true,
            label: 'Itinéraire',
          },
        },
        { size: 'half', media: photos.studio },
      ],
    })
  })

  it('keeps the dots beside the title and has no photo on a new site', () => {
    const { hero, layout } = contactPageData({ contactForm })

    expect(hero).toMatchObject({ type: 'lowImpact', dotPattern: true })
    expect(hero.media).toBeUndefined()
    expect(JSON.stringify(layout)).not.toContain('"media"')
  })
})
