import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-vercel-postgres'

import { effectCards } from '../endpoints/seed/home'
import type { Page } from '../payload-types'

// Gives each of the three effect cards at the top of the home page a button to its service's page
// under Prestations, as on the Prestations page. Only those buttons are added, to cards that still
// have their title and no button, so everything else edited in the admin, such as client reviews,
// stays. Changes saved in the admin but not published yet get the buttons too and stay unpublished.
// Sites that were not seeded yet get the buttons from the starter pages button instead.
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // Checking for pages with SQL rather than Payload keeps this migration working on a new site
  // after later schema changes
  const { rows } = await db.execute(sql`select 1 from pages limit 1`)
  if (rows.length === 0) return

  const findPage = async (slug: string, draft = false) =>
    (
      await payload.find({
        collection: 'pages',
        depth: 0,
        draft,
        limit: 1,
        req,
        where: { slug: { equals: slug } },
      })
    ).docs[0]

  // The home page as published, and its latest version, which holds the unpublished changes if any
  const [home, latest, effetRase, densification, camouflage] = await Promise.all([
    findPage('home'),
    findPage('home', true),
    findPage('effet-rase'),
    findPage('densification-capillaire'),
    findPage('camouflage-de-cicatrices'),
  ])
  if (!home || !latest || !effetRase || !densification || !camouflage) return

  const cards = effectCards({ effetRase, densification, camouflage })

  // The layout with the buttons added, or nothing when every card already has its button
  const withButtons = (layout: Page['layout']) => {
    let changed = false
    const result = layout.map((block) => {
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
    return changed ? result : undefined
  }

  const save = (data: Page, draft: boolean) =>
    payload.update({
      collection: 'pages',
      id: home.id,
      data,
      depth: 0,
      draft,
      req,
      // Migrations run before the build, which renders the new content anyway
      context: { disableRevalidate: true },
    })

  // The whole published page is saved back: fields left out would be taken from the unpublished
  // changes, status included, which would unpublish the page
  const publishedLayout = home._status === 'published' ? withButtons(home.layout) : undefined
  if (publishedLayout) await save({ ...home, layout: publishedLayout }, false)

  // Saving the published page makes it the latest version, the one the admin opens, so the
  // unpublished changes are saved again on top of it, with the buttons too
  if (latest._status === 'draft') {
    const draftLayout = withButtons(latest.layout)
    if (draftLayout || publishedLayout) {
      await save({ ...latest, layout: draftLayout ?? latest.layout }, true)
    }
  }
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // Content change only. The previous home page stays in the page's version history.
}
