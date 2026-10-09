import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-vercel-postgres'
import type { RequiredDataFromCollectionSlug } from 'payload'

import type { Page } from '@/payload-types'

import { prestationsPageData, servicePagesData } from '../endpoints/seed/prestations'

// Adds the effet rasé, densification capillaire and camouflage de cicatrices pages from Léo's
// prestations document under Prestations (/prestations/effet-rase), and turns the Prestations page
// into their overview, with a card leading to each. Sites that were not seeded yet get them from the
// starter pages button instead. Runs after 20261009_130834_nested_pages, which lets pages have a
// parent; the preview database ran an earlier version that left the pages at the root.
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

  const [contact, faq, galerie, prestations] = await Promise.all(
    ['contact', 'faq', 'galerie', 'prestations'].map(findPage),
  )
  if (!contact || !faq || !galerie || !prestations) return

  // Migrations run before the build, which renders the new content anyway
  const context = { disableRevalidate: true }

  // Creates the page, or brings it up to date if a page already uses its slug
  const savePage = async (data: RequiredDataFromCollectionSlug<'pages'>): Promise<Page> => {
    const existing = await findPage(data.slug!)
    return existing
      ? payload.update({ collection: 'pages', id: existing.id, data, depth: 0, req, context })
      : payload.create({ collection: 'pages', data, depth: 0, req, context })
  }

  const servicePages = servicePagesData({ contact, faq, galerie, prestations })
  const services = {
    effetRase: await savePage(servicePages.effetRase),
    densification: await savePage(servicePages.densification),
    camouflage: await savePage(servicePages.camouflage),
  }

  await payload.update({
    collection: 'pages',
    id: prestations.id,
    data: prestationsPageData({ contact, services }),
    depth: 0,
    req,
    context,
  })
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // Content change only. The previous Prestations page stays in its version history.
}
