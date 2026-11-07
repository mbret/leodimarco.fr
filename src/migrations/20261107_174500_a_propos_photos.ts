import path from 'path'
import { fileURLToPath } from 'url'

import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-vercel-postgres'

import { aProposPageData } from '../endpoints/seed/aPropos'

const photosDir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'media')

// Puts photos on the À propos page: Léo in his studio beside the title, Léo at work beside his
// training, three photos of the studio and his face on the closing call to action. The text does not
// change. The photos are uploaded from the media folder next to this file. Their names start with
// a-propos- so that they never replace an image uploaded from the admin: preview deployments upload
// to the same bucket as production. Sites that were not seeded yet get the page without photos from
// the starter pages button instead.
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // Checking for pages with SQL rather than Payload keeps this migration working on a new site
  // after later schema changes
  const { rows } = await db.execute(sql`select 1 from pages limit 1`)
  if (rows.length === 0) return

  const findPage = async (slug: string) =>
    (
      await payload.find({
        collection: 'pages',
        depth: 0,
        limit: 1,
        req,
        where: { slug: { equals: slug } },
      })
    ).docs[0]

  const [aPropos, contact] = await Promise.all(['a-propos', 'contact'].map(findPage))
  if (!aPropos || !contact) return

  // The focal point, in percent of the width and height, stays in view when the photo is cropped
  const upload = async (file: string, alt: string, focal?: { x: number; y: number }) =>
    (
      await payload.create({
        collection: 'media',
        data: { alt, ...(focal && { focalX: focal.x, focalY: focal.y }) },
        depth: 0,
        filePath: path.join(photosDir, file),
        req,
      })
    ).id

  const photos = {
    // Léo stands left of the middle, his face in the upper third
    portrait: await upload(
      'a-propos-studio.jpg',
      'Léo Di Marco dans son studio de tricopigmentation à Pompey',
      { x: 38, y: 35 },
    ),
    session: await upload(
      'a-propos-seance.jpg',
      'Léo Di Marco pendant une séance, ses certificats de formation au mur',
    ),
    studio: [
      await upload('a-propos-studio-fauteuil.jpg', 'Le fauteuil du studio devant le mur vert'),
      await upload('a-propos-studio-verriere.jpg', 'Le fauteuil face à la verrière du studio'),
      await upload(
        'a-propos-studio-poste.jpg',
        'Le poste de travail du studio, avec le lavabo et les diplômes au mur',
      ),
    ] as [number, number, number],
    face: await upload('a-propos-portrait.jpg', 'Léo Di Marco'),
  }

  await payload.update({
    collection: 'pages',
    id: aPropos.id,
    data: aProposPageData({ contact, photos }),
    depth: 0,
    req,
    // Migrations run before the build, which renders the new content anyway
    context: { disableRevalidate: true },
  })
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // Content change only. The previous À propos page stays in the page's version history, and the
  // photos stay in the media library.
}
