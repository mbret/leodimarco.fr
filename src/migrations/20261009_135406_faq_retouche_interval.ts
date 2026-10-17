import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-vercel-postgres'

// The FAQ said retouches come every 12 to 18 months and the Effet rasé page every 18 to 24: the
// FAQ now says 18 to 24 too. The interval is its own text, in bold italic, and only that exact
// text is replaced, so an answer rewritten in the admin is left untouched.
const FROM = '12 et 18 mois'
const TO = '18 et 24 mois'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // A new site has no pages yet and gets the new interval from the starter content. Checking with
  // SQL rather than Payload keeps this migration working after later schema changes.
  const { rows } = await db.execute(sql`select 1 from pages limit 1`)
  if (rows.length === 0) return

  const faq = (
    await payload.find({
      collection: 'pages',
      depth: 0,
      limit: 1,
      req,
      where: { slug: { equals: 'faq' } },
    })
  ).docs[0]
  if (!faq) return

  // Replaces whole string values only: a text that merely contains the interval is not changed
  const layout = JSON.stringify(faq.layout)
  const reworded = layout.split(JSON.stringify(FROM)).join(JSON.stringify(TO))
  if (reworded === layout) return

  await payload.update({
    collection: 'pages',
    id: faq.id,
    data: { layout: JSON.parse(reworded) },
    depth: 0,
    req,
    // Migrations run before the build, which renders the new content anyway
    context: { disableRevalidate: true },
  })
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // Content change only. The previous FAQ stays in the page's version history.
}
