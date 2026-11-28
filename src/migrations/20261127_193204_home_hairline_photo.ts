import path from 'path'
import { fileURLToPath } from 'url'

import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-vercel-postgres'

const photosDir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'media')

// Shows the frontal hairline beside the home page title, in place of the healed result seen from the
// front: a wide crop from the top of the head to the eyebrows, which reads as a band across the
// screen on phones. It changes only that photo, and only while the home page still shows the earlier
// one and has no unpublished draft, so that a photo or a draft set in the admin stays as it is.
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

  // The latest version, a draft when one is newer than the published page
  const home = (
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
  if (!home || home._status !== 'published' || !earlier || home.hero.media !== earlier.id) return

  const hairline =
    (await findMedia('realisation-ligne-frontale.jpg'))?.id ??
    (
      await payload.create({
        collection: 'media',
        data: { alt: 'Ligne frontale d’une tricopigmentation effet rasé, vue de face' },
        depth: 0,
        filePath: path.join(photosDir, 'realisation-ligne-frontale.jpg'),
        req,
      })
    ).id

  await payload.update({
    collection: 'pages',
    id: home.id,
    data: { hero: { ...home.hero, media: hairline } },
    depth: 0,
    req,
    // Migrations run before the build, which renders the new photo anyway
    context: { disableRevalidate: true },
  })
}

// The earlier photo stays in the media library, and the previous page in the page's version history
export async function down(_args: MigrateDownArgs): Promise<void> {}
