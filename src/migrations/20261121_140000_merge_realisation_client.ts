import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-vercel-postgres'

import type { Realisation } from '@/payload-types'

// Two of Léo's réalisations show the same client, photographed on two days. This keeps the one with
// the 3/4 view realisation-effet-rase-4.jpg, gives it one photo per view from both days, and deletes
// the other one. realisation-effet-rase-4-dos.jpg, the farther of his two back views, stays in Media.
// It does so only while both still hold the photos 20261113_145332_realisation_views gave them, so
// that nothing edited in the admin is lost.
const keptFiles = [
  'realisation-effet-rase-4.jpg',
  'realisation-effet-rase-4-face.jpg',
  'realisation-effet-rase-4-dos.jpg',
]
const mergedFiles = ['realisation-effet-rase-3-trois-quarts.jpg', 'realisation-effet-rase-3.jpg']
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

  const imagesOf = (realisation: Realisation) =>
    realisation.photos
      .map(({ image }) => (typeof image === 'object' ? image.id : image))
      .sort()
      .join()
  const idsOf = async (files: string[]) => (await Promise.all(files.map(mediaId))).sort().join()
  if (
    imagesOf(kept) !== (await idsOf(keptFiles)) ||
    imagesOf(merged) !== (await idsOf(mergedFiles)) ||
    merged.description
  ) {
    payload.logger.warn(
      'The two réalisations of the same client changed since: they are not merged',
    )
    return
  }

  const ids = new Map<string, number>()
  for (const file of [...keptFiles, ...mergedFiles]) {
    const id = await mediaId(file)
    if (id) ids.set(file, id)
  }
  const list = photos.map(({ view, file }) => ({ view, image: ids.get(file) as number }))

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
  payload.logger.info(`Deleting réalisation ${JSON.stringify(merged)}`)
  await payload.delete({ collection: 'realisations', id: merged.id, depth: 0, req, context })

  // The photo first described as a 3/4 view shows his right side
  await payload.update({
    collection: 'media',
    id: ids.get('realisation-effet-rase-3-trois-quarts.jpg') as number,
    data: { alt: 'Tricopigmentation effet rasé cicatrisée, vue de profil, barbe rousse' },
    depth: 0,
    req,
  })
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // Content change only. Undo it in the admin: the deleted réalisation's photos stay in Media.
}
