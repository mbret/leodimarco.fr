import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-vercel-postgres'

import type { Realisation } from '@/payload-types'

// Two of Léo's réalisations show the same client, photographed on two days. This keeps the one with
// the 3/4 view realisation-effet-rase-4.jpg, gives it one photo per view from both days, and deletes
// the other one. realisation-effet-rase-4-dos.jpg, the farther of his two back views, stays in Media.
const photos: { view: Realisation['photos'][number]['view']; file: string }[] = [
  { view: 'troisQuarts', file: 'realisation-effet-rase-4.jpg' },
  { view: 'face', file: 'realisation-effet-rase-4-face.jpg' },
  { view: 'profil', file: 'realisation-effet-rase-3-trois-quarts.jpg' },
  { view: 'dos', file: 'realisation-effet-rase-3.jpg' },
]

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // Checking for pages with SQL rather than Payload keeps this migration working on a new site
  // after later schema changes
  const { rows: pages } = await db.execute(sql`select 1 from pages limit 1`)
  if (pages.length === 0) return

  const mediaId = async (file: string) =>
    (
      await payload.find({
        collection: 'media',
        depth: 0,
        limit: 1,
        req,
        where: { filename: { equals: file } },
      })
    ).docs[0]?.id

  const realisationShowing = async (file: string) => {
    const image = await mediaId(file)
    if (!image) return undefined
    return (
      await payload.find({
        collection: 'realisations',
        depth: 0,
        limit: 1,
        req,
        where: { 'photos.image': { equals: image } },
      })
    ).docs[0]
  }

  const kept = await realisationShowing('realisation-effet-rase-4.jpg')
  const merged = await realisationShowing('realisation-effet-rase-3.jpg')
  if (!kept || !merged || kept.id === merged.id) {
    payload.logger.info('No two réalisations of the same client to merge')
    return
  }

  const list = []
  for (const { view, file } of photos) {
    const image = await mediaId(file)
    if (!image) {
      payload.logger.warn(`${file} is missing from Media: the réalisations are not merged`)
      return
    }
    list.push({ view, image })
  }

  // Migrations run before the build, which renders the gallery anyway
  const context = { disableRevalidate: true }
  await payload.update({
    collection: 'realisations',
    id: kept.id,
    data: { photos: list },
    depth: 0,
    req,
    context,
  })
  await payload.delete({ collection: 'realisations', id: merged.id, depth: 0, req, context })

  // The photo first described as a 3/4 view shows his right side
  await payload.update({
    collection: 'media',
    where: { filename: { equals: 'realisation-effet-rase-3-trois-quarts.jpg' } },
    data: { alt: 'Tricopigmentation effet rasé cicatrisée, vue de profil, barbe rousse' },
    depth: 0,
    req,
  })
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // Content change only. Undo it in the admin: the deleted réalisation's photos stay in Media.
}
