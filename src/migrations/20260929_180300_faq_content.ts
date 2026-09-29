import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-vercel-postgres'

import { faqPageData } from '../endpoints/seed/faq'

// Fills the FAQ page with the categorised content from Léo's mockup. Sites that were not
// seeded yet get it from the starter pages button instead.
export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
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

  const [faq, contact] = await Promise.all([findPage('faq'), findPage('contact')])
  if (!faq || !contact) return

  await payload.update({
    collection: 'pages',
    id: faq.id,
    data: faqPageData(contact),
    depth: 0,
    req,
    // Migrations run before the build, which renders the new content anyway
    context: { disableRevalidate: true },
  })
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // Content change only. The previous placeholder questions are not restored: the schema
  // migration drops them, including from version history, since nothing depended on them.
}
