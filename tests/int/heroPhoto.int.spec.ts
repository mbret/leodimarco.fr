import { getPayload, type Payload, type RequiredDataFromCollectionSlug } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { heading, paragraph, richText } from '@/endpoints/seed/richText'
import config from '@/payload.config'

let payload: Payload
const slug = 'test-hero-photo'

beforeAll(async () => {
  payload = await getPayload({ config: await config })
})

afterAll(async () => {
  await payload.delete({
    collection: 'pages',
    where: { slug: { equals: slug } },
    context: { disableRevalidate: true },
  })
})

const publish = (type: RequiredDataFromCollectionSlug<'pages'>['hero']['type']) =>
  payload.create({
    collection: 'pages',
    data: {
      _status: 'published',
      slug,
      title: 'Test',
      hero: { type, richText: richText(heading('Test')) },
      layout: [{ blockType: 'content', columns: [{ richText: richText(paragraph('Texte.')) }] }],
    },
    context: { disableRevalidate: true },
  })

describe('Hero photo', () => {
  it('is required for the green band and the High Impact hero', async () => {
    const missingPhoto = { data: { errors: [{ path: 'hero.media' }] } }
    await expect(publish('mediumImpact')).rejects.toMatchObject(missingPhoto)
    await expect(publish('highImpact')).rejects.toMatchObject(missingPhoto)
  })

  it('is optional for the Low Impact hero', async () => {
    await expect(publish('lowImpact')).resolves.toMatchObject({ slug })
  })
})
