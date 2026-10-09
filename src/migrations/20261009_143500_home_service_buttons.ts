import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-vercel-postgres'

import { effectCards } from '../endpoints/seed/home'

// Gives each of the three effect cards at the top of the home page a button to its service's page
// under Prestations, as on the Prestations page. The page is read and saved back with only those
// buttons added, to cards that still have their title and no button, so everything else edited in
// the admin, such as client reviews, stays. Sites that were not seeded yet get the buttons from the
// starter pages button instead.
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

  const [home, effetRase, densification, camouflage] = await Promise.all(
    ['home', 'effet-rase', 'densification-capillaire', 'camouflage-de-cicatrices'].map(findPage),
  )
  if (!home || !effetRase || !densification || !camouflage) return

  const cards = effectCards({ effetRase, densification, camouflage })

  let changed = false
  const layout = home.layout.map((block) => {
    if (block.blockType !== 'services') return block

    return {
      ...block,
      items: block.items.map((item) => {
        const card = cards.find(({ title }) => title === item.title)
        if (!card?.link || item.enableLink) return item

        changed = true
        return { ...item, enableLink: true, link: card.link }
      }),
    }
  })
  if (!changed) return

  await payload.update({
    collection: 'pages',
    id: home.id,
    data: { layout },
    depth: 0,
    req,
    // Migrations run before the build, which renders the new content anyway
    context: { disableRevalidate: true },
  })
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // Content change only. The previous home page stays in the page's version history.
}
