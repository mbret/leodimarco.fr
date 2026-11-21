import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-vercel-postgres'

// Léo found the FAQ still too heavy with emphasised words and asked for none. This removes the bold
// from the text of the FAQ page's hero and answers, with the italics that came with it. Words in
// italics only, such as foreign words, keep their italics.
const BOLD = 1
const ITALIC = 2

type LexicalNode = { type?: unknown; format?: unknown; children?: LexicalNode[] }

// Returns true if a text node in the tree lost its bold
const dropBold = (node: LexicalNode): boolean => {
  let changed = false
  if (node.type === 'text' && typeof node.format === 'number' && node.format & BOLD) {
    node.format &= ~(BOLD | ITALIC)
    changed = true
  }
  for (const child of node.children || []) changed = dropBold(child) || changed
  return changed
}

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // A new site has no pages yet and gets the FAQ without emphasis from the starter content.
  // Checking with SQL rather than Payload keeps this migration working after later schema changes.
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

  const hero = structuredClone(faq.hero)
  const layout = structuredClone(faq.layout)
  const roots = [
    hero.richText?.root,
    ...layout.flatMap((block) =>
      block.blockType === 'faq'
        ? block.categories.flatMap(({ items }) => items.map(({ answer }) => answer.root))
        : [],
    ),
  ]
  const changed = roots.map((root) => (root ? dropBold(root) : false)).some(Boolean)
  if (!changed) return

  await payload.update({
    collection: 'pages',
    id: faq.id,
    data: { hero, layout },
    depth: 0,
    req,
    // Migrations run before the build, which renders the new content anyway
    context: { disableRevalidate: true },
  })
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // Content change only. The previous FAQ stays in the page's version history.
}
