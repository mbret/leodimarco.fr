import path from 'path'
import { fileURLToPath } from 'url'

import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-vercel-postgres'

const photosDir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'media')

// Shows the frontal hairline beside « Une bonne tricopigmentation ne se remarque pas », in place of
// the close-up of the temple: a wide photo, cropped from a front view, that reads as a band on
// phones and sits on the right on large screens. It changes only that photo, and only while the
// home page still shows the close-up and has no unpublished draft, so that a photo or a draft set
// in the admin stays as it is.
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
  const closeUp = await findMedia('realisation-effet-rase-gros-plan.jpg')
  if (!home || home._status !== 'published' || !closeUp) return

  const layout = home.layout ?? []
  const showsCloseUp = (media: unknown) => media === closeUp.id
  const hasCloseUp = layout.some(
    (block) =>
      block.blockType === 'content' && block.columns?.some(({ media }) => showsCloseUp(media)),
  )
  if (!hasCloseUp) return

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
    data: {
      layout: layout.map((block) =>
        block.blockType === 'content'
          ? {
              ...block,
              columns: block.columns?.map((column) =>
                showsCloseUp(column.media) ? { ...column, media: hairline } : column,
              ),
            }
          : block,
      ),
    },
    depth: 0,
    req,
    // Migrations run before the build, which renders the new photo anyway
    context: { disableRevalidate: true },
  })
}

// The close-up stays in the media library, and the previous page in the page's version history
export async function down(_args: MigrateDownArgs): Promise<void> {}
