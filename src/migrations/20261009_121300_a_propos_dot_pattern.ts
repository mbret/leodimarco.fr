import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-vercel-postgres'

// Turns on the dot pattern beside the À propos title. Only that header option changes, so edits
// made to the rest of the page are kept. Sites that were not seeded yet get it from the starter
// pages button instead.
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // Checking for pages with SQL rather than Payload keeps this migration working on a new site
  // after later schema changes
  const { rows } = await db.execute(sql`select 1 from pages limit 1`)
  if (rows.length === 0) return

  const aPropos = (
    await payload.find({
      collection: 'pages',
      depth: 0,
      limit: 1,
      req,
      where: { slug: { equals: 'a-propos' } },
    })
  ).docs[0]
  if (!aPropos) return

  await payload.update({
    collection: 'pages',
    id: aPropos.id,
    data: { hero: { ...aPropos.hero, dotPattern: true } },
    depth: 0,
    req,
    // Migrations run before the build, which renders the new content anyway
    context: { disableRevalidate: true },
  })
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // Content change only. The previous À propos page stays in the page's version history.
}
