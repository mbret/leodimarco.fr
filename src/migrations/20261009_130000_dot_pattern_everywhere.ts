import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-vercel-postgres'

// Turns on the dot pattern beside the title of every published page with a Low Impact header. Only
// that header option changes, so the rest of each page is kept as it is. Sites that were not seeded
// yet get it from the starter pages button instead.
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // Checking for pages with SQL rather than Payload keeps this migration working on a new site
  // after later schema changes
  const { rows } = await db.execute(sql`select 1 from pages limit 1`)
  if (rows.length === 0) return

  const { docs: pages } = await payload.find({
    collection: 'pages',
    depth: 0,
    pagination: false,
    req,
    where: { 'hero.type': { equals: 'lowImpact' }, _status: { equals: 'published' } },
  })

  for (const page of pages) {
    if (page.hero.dotPattern) continue

    await payload.update({
      collection: 'pages',
      id: page.id,
      data: { hero: { ...page.hero, dotPattern: true } },
      depth: 0,
      req,
      // Migrations run before the build, which renders the new content anyway
      context: { disableRevalidate: true },
    })
  }
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // Content change only. The previous pages stay in their version history.
}
