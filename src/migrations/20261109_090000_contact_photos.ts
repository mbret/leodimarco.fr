import path from 'path'
import { fileURLToPath } from 'url'

import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-vercel-postgres'

import { type ContactPhotos, contactPageData } from '../endpoints/seed/contact'

const photosDir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'media')

// Rebuilds the Contact page with its photos. It rewrites the whole page from the seed data, so edits
// made in the admin since the page was created are lost.
// The file names start with contact- so that they never replace an image uploaded from the
// production admin: preview deployments upload to the same bucket. Léo's face reuses the photo
// that the À propos migration uploaded.
// Sites that were not seeded yet get the page without photos from the starter pages button instead.
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // Checking for pages with SQL rather than Payload keeps this migration working on a new site
  // after later schema changes
  const { rows } = await db.execute(sql`select 1 from pages limit 1`)
  if (rows.length === 0) return

  const {
    docs: [contact],
  } = await payload.find({
    collection: 'pages',
    depth: 0,
    limit: 1,
    req,
    where: { slug: { equals: 'contact' } },
  })
  const contactForm = contact?.layout?.find((block) => block.blockType === 'formBlock')?.form
  if (!contact || !contactForm) return

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

  const findOrUpload = async (file: string, alt: string) =>
    (
      await payload.find({
        collection: 'media',
        depth: 0,
        limit: 1,
        req,
        where: { filename: { equals: file } },
      })
    ).docs[0]?.id ?? upload(file, alt)

  const photos: ContactPhotos = {
    // The chair faces the window in the middle of the photo
    hero: await upload('contact-studio.jpg', 'Le fauteuil du studio face à la verrière', {
      x: 50,
      y: 45,
    }),
    contactCard: await findOrUpload('a-propos-leo-visage.jpg', 'Léo Di Marco'),
    views: [
      await upload('contact-vue-face.jpg', 'Exemple de photo à envoyer : de face'),
      await upload('contact-vue-cote.jpg', 'Exemple de photo à envoyer : de côté'),
      await upload('contact-vue-dos.jpg', 'Exemple de photo à envoyer : de dos'),
    ],
    studio: await upload(
      'contact-studio-salle.jpg',
      'Le studio de Pompey, le fauteuil devant le mur vert',
    ),
  }

  await payload.update({
    collection: 'pages',
    id: contact.id,
    data: contactPageData({ contactForm, photos }),
    depth: 0,
    req,
    // Migrations run before the build, which renders the new content anyway
    context: { disableRevalidate: true },
  })
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // Content change only. The previous Contact page stays in the page's version history, and the
  // photos stay in the media library.
}
