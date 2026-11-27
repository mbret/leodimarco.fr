import { describe, expect, it } from 'vitest'

import { pageEnd } from '@/app/(frontend)/[...slug]/pageEnd'
import type { Page } from '@/payload-types'

const dotsHero: Page['hero'] = { type: 'lowImpact', dotPattern: true }
const card = { blockType: 'cta' as const }
const band = { blockType: 'cta' as const, style: 'band' as const }

describe('Page end', () => {
  it('mirrors the dots beside the title at the bottom left', () => {
    expect(pageEnd({ hero: dotsHero, layout: [card] })).toEqual({ band: false, dots: true })
  })

  it('rests a final green band on the footer, without the dots it would cover', () => {
    expect(pageEnd({ hero: dotsHero, layout: [band] })).toEqual({ band: true, dots: false })
    expect(pageEnd({ hero: dotsHero, layout: [band, card] })).toEqual({ band: false, dots: true })
  })

  it('has no dots after a photo hero', () => {
    expect(
      pageEnd({ hero: { type: 'photo', dotPattern: true, media: 1 }, layout: [card] }).dots,
    ).toBe(false)
  })
})
