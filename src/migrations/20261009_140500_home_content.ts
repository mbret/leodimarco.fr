import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-vercel-postgres'

import { homePageData } from '../endpoints/seed/home'

// Fills the home page with the content of Léo's home page document: the three effects, the
// presentation, the studio, client reviews, three questions and the photo call to action. Sites
// that were not seeded yet get it from the starter pages button instead. Renamed from
// 20261009_111700_home_content so the preview database, which ran that first version, applies
// this one too, and so it runs after the hero dot pattern migrations: saving the page through
// Payload needs their column.
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

  const [home, aPropos, contact, faq, galerie] = await Promise.all(
    ['home', 'a-propos', 'contact', 'faq', 'galerie'].map(findPage),
  )
  if (!home || !aPropos || !contact || !faq || !galerie) return

  await payload.update({
    collection: 'pages',
    id: home.id,
    data: homePageData({ aPropos, contact, faq, galerie }),
    depth: 0,
    req,
    // Migrations run before the build, which renders the new content anyway
    context: { disableRevalidate: true },
  })
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // Content change only. The previous home page stays in the page's version history.
}
