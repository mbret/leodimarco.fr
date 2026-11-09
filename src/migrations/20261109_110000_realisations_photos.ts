import path from 'path'
import { fileURLToPath } from 'url'

import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-vercel-postgres'

const photosDir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'media')

// Healed results, one per client and a close-up of the dots, in the order the gallery shows them
const realisations = [
  {
    file: 'realisation-effet-rase-1.jpg',
    title: 'Effet rasé, de trois quarts',
    alt: 'Tricopigmentation effet rasé cicatrisée, vue de trois quarts sur fond gris',
  },
  {
    file: 'realisation-effet-rase-2.jpg',
    title: 'Effet rasé, de face',
    alt: 'Tricopigmentation effet rasé cicatrisée, vue de face sur fond gris',
  },
  {
    file: 'realisation-effet-rase-3.jpg',
    title: 'Effet rasé, de dos',
    alt: 'Tricopigmentation effet rasé cicatrisée, vue de dos',
  },
  {
    file: 'realisation-effet-rase-4.jpg',
    title: 'Effet rasé, de trois quarts',
    alt: 'Tricopigmentation effet rasé cicatrisée, vue de trois quarts, tête penchée',
  },
  {
    file: 'realisation-effet-rase-5.jpg',
    title: 'Effet rasé, de face',
    alt: 'Tricopigmentation effet rasé cicatrisée, vue de face sur fond vert foncé',
  },
  {
    file: 'realisation-effet-rase-gros-plan.jpg',
    title: 'Effet rasé, en gros plan',
    alt: 'Micro-points de tricopigmentation cicatrisés, en gros plan sur la tempe',
  },
]

// Fills the Résultats page with Léo's healed results. It adds them only while the gallery is empty,
// so réalisations entered in the admin are never duplicated or reordered.
// The file names start with realisation- so that they never replace an image uploaded from the
// production admin: preview deployments upload to the same bucket. For the same reason, deleting
// one of these photos from a preview admin deletes production's file.
// A site that was not seeded yet keeps an empty gallery: the seed creates no réalisations.
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // Checking with SQL rather than Payload keeps this migration working on a new site after later
  // schema changes
  const { rows: pages } = await db.execute(sql`select 1 from pages limit 1`)
  if (pages.length === 0) return
  const { rows: existing } = await db.execute(sql`select 1 from realisations limit 1`)
  if (existing.length > 0) {
    payload.logger.info('The gallery already holds réalisations: the healed results are not added')
    return
  }

  // One at a time, so that each réalisation goes after the previous one in the gallery
  for (const { file, title, alt } of realisations) {
    const image = await payload.create({
      collection: 'media',
      data: { alt },
      depth: 0,
      filePath: path.join(photosDir, file),
      req,
    })
    await payload.create({
      collection: 'realisations',
      data: { image: image.id, title },
      depth: 0,
      req,
      // Migrations run before the build, which renders the gallery anyway
      context: { disableRevalidate: true },
    })
  }
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // Content change only. The réalisations and their photos stay; delete them in the admin if needed.
}
