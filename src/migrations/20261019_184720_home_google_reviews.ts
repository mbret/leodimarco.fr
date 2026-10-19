import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-vercel-postgres'

import { googleReviews } from '../endpoints/seed/home'
import type { Page } from '../payload-types'

// Shows three of Léo's Google reviews in the home page's client reviews section, above the link to
// all of them. Only a section without reviews gets them, so reviews added in the admin stay.
// Changes saved in the admin but not published yet get the reviews too and stay unpublished. Sites
// that were not seeded yet get them from the starter pages button instead.
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // Checking for pages with SQL rather than Payload keeps this migration working on a new site
  // after later schema changes
  const { rows } = await db.execute(sql`select 1 from pages limit 1`)
  if (rows.length === 0) return

  const findHome = async (draft: boolean) =>
    (
      await payload.find({
        collection: 'pages',
        depth: 0,
        draft,
        limit: 1,
        req,
        where: { slug: { equals: 'home' } },
      })
    ).docs[0]

  // The home page as published, and its latest version, which holds the unpublished changes if any
  const [home, latest] = await Promise.all([findHome(false), findHome(true)])
  if (!home || !latest) return

  // The layout with the reviews added, or nothing when every reviews section already has some
  const withReviews = (layout: Page['layout']) => {
    let changed = false
    const result = layout.map((block) => {
      if (block.blockType !== 'testimonials' || block.reviews?.length) return block

      changed = true
      return { ...block, reviews: googleReviews }
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
  const publishedLayout = home._status === 'published' ? withReviews(home.layout) : undefined
  if (publishedLayout) await save({ ...home, layout: publishedLayout }, false)

  // Saving the published page makes it the latest version, the one the admin opens, so the
  // unpublished changes are saved again on top of it, with the reviews too
  if (latest._status === 'draft') {
    const draftLayout = withReviews(latest.layout)
    if (draftLayout || publishedLayout) {
      await save({ ...latest, layout: draftLayout ?? latest.layout }, true)
    }
  }
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // Content change only. The previous home page stays in the page's version history.
}
