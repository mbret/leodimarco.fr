import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-vercel-postgres'

import { faqPageData } from '../endpoints/seed/faq'

// Fills the FAQ page with the content of Léo's final FAQ document: three highlighted questions,
// four categories, the first three ending with a button to another page, then the contact call
// to action. Sites that were not seeded yet get it from the starter pages button instead.
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

  const [faq, aPropos, contact, galerie, prestations] = await Promise.all(
    ['faq', 'a-propos', 'contact', 'galerie', 'prestations'].map(findPage),
  )
  if (!faq || !aPropos || !contact || !galerie || !prestations) return

  await payload.update({
    collection: 'pages',
    id: faq.id,
    data: faqPageData({ aPropos, contact, galerie, prestations }),
    depth: 0,
    req,
    // Migrations run before the build, which renders the new content anyway
    context: { disableRevalidate: true },
  })
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // Content change only. The previous FAQ stays in the page's version history.
}
