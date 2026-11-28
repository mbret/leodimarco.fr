import path from 'path'
import { fileURLToPath } from 'url'

import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-vercel-postgres'

const photosDir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'media')

const HAIRLINE = 'realisation-ligne-frontale.jpg'

// Puts a crop of the frontal hairline in Médias, and in the home hero in place of the healed result
// seen from the front. The hero changes only while it still shows the earlier photo and the page
// has no unpublished draft, so that a photo or a draft set in the admin stays as it is.
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // Checking for pages with SQL rather than Payload keeps this migration working on a new site
  // after later schema changes
  const { rows } = await db.execute(sql`select 1 from pages limit 1`)
  if (rows.length === 0) return

  const findMedia = async (filename: string) =>
    (
      await payload.find({
        collection: 'media',
        depth: 0,
        limit: 1,
        req,
        where: { filename: { equals: filename } },
      })
    ).docs[0]

  // In Médias even when the hero keeps its photo, so that the crop can be picked in the admin
  const hairline =
    (await findMedia(HAIRLINE))?.id ??
    (
      await payload.create({
        collection: 'media',
        data: { alt: 'Ligne frontale d’une tricopigmentation effet rasé, vue de face' },
        depth: 0,
        filePath: path.join(photosDir, HAIRLINE),
        req,
      })
    ).id

  const latestHome = (
    await payload.find({
      collection: 'pages',
      depth: 0,
      draft: true,
      limit: 1,
      req,
      where: { slug: { equals: 'home' } },
    })
  ).docs[0]
  const earlier = await findMedia('realisation-effet-rase-5.jpg')
  if (!latestHome || !earlier || latestHome.hero.media !== earlier.id) return
  // The page saves a draft while it is edited, so a change left unpublished blocks the swap
  if (latestHome._status !== 'published') {
    payload.logger.warn(`The home page has an unpublished draft: pick ${HAIRLINE} in its hero`)
    return
  }

  await payload.update({
    collection: 'pages',
    id: latestHome.id,
    data: { hero: { ...latestHome.hero, media: hairline } },
    depth: 0,
    req,
    // Migrations run before the build, which renders the new photo anyway
    context: { disableRevalidate: true },
  })
}

// The earlier photo stays in the media library, and the previous page in the page's version history
export async function down(_args: MigrateDownArgs): Promise<void> {}
