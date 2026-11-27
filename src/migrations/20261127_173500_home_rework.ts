import path from 'path'
import { fileURLToPath } from 'url'

import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-vercel-postgres'

import { type HomePhotos, homePageData } from '../endpoints/seed/home'
import { headerButton } from '../endpoints/seed/links'

const photosDir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'media')

// Rebuilds the home page around photos. It rewrites the whole page from the seed
// data, as 20261009_140500_home_content did: edits made in the admin since are lost, and the
// previous page stays in its version history. It also gives the header its button to send photos,
// unless it has one.
// The photos are the ones the earlier migrations uploaded, found by file name, or uploaded again
// from src/migrations/media where one is missing.
// Sites that were not seeded yet get the page without photos from the starter pages button instead.
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

  const [home, aPropos, contact, faq, galerie, prestations, effetRase, densification, camouflage] =
    await Promise.all(
      [
        'home',
        'a-propos',
        'contact',
        'faq',
        'galerie',
        'prestations',
        'effet-rase',
        'densification-capillaire',
        'camouflage-de-cicatrices',
      ].map(findPage),
    )
  if (!home || !aPropos || !contact || !faq || !galerie || !prestations) return
  // Without its service pages, an effect card would lose its button
  if (!effetRase || !densification || !camouflage) return

  // The focal point, in percent of the width and height, stays in view when the photo is cropped
  const findOrUpload = async (file: string, alt: string, focal?: { x: number; y: number }) =>
    (
      await payload.find({
        collection: 'media',
        depth: 0,
        limit: 1,
        req,
        where: { filename: { equals: file } },
      })
    ).docs[0]?.id ??
    (
      await payload.create({
        collection: 'media',
        data: { alt, ...(focal && { focalX: focal.x, focalY: focal.y }) },
        depth: 0,
        filePath: path.join(photosDir, file),
        req,
      })
    ).id

  const photos: HomePhotos = {
    hero: await findOrUpload(
      'realisation-effet-rase-5.jpg',
      'Tricopigmentation effet rasé cicatrisée, vue de face sur fond vert foncé',
    ),
    technique: await findOrUpload(
      'realisation-effet-rase-gros-plan.jpg',
      'Micro-points de tricopigmentation cicatrisés, en gros plan sur la tempe',
    ),
    // Léo stands left of the middle, his face in the upper third
    story: await findOrUpload(
      'a-propos-leo.jpg',
      'Léo Di Marco dans son studio de tricopigmentation à Pompey',
      { x: 38, y: 35 },
    ),
  }

  await payload.update({
    collection: 'pages',
    id: home.id,
    data: homePageData({
      aPropos,
      contact,
      faq,
      galerie,
      photos,
      prestations,
      services: { effetRase, densification, camouflage },
    }),
    depth: 0,
    req,
    // Migrations run before the build, which renders the new content anyway
    context: { disableRevalidate: true },
  })

  const header = await payload.findGlobal({ slug: 'header', depth: 0, req })
  if (!header.enableButton) {
    await payload.updateGlobal({
      slug: 'header',
      data: headerButton,
      depth: 0,
      req,
      context: { disableRevalidate: true },
    })
  }
}

// The previous home page stays in the page's version history, and the photos stay in the media
// library
export async function down(_args: MigrateDownArgs): Promise<void> {}
