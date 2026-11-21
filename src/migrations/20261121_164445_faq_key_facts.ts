import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-vercel-postgres'

// Léo found the FAQ too heavy with emphasised words. Each answer now keeps at most its key fact in
// bold italics, and the hero keeps none. Words in italics only, such as foreign words, keep their
// italics. An answer whose question or key fact was changed in the admin loses all its emphasis.
const BOLD = 1
const ITALIC = 2

// The emphasised text that each answer keeps, by question
const keyFacts: Record<string, string[]> = {
  'Qu’est-ce que la tricopigmentation ?': ['micropigmentation capillaire semi-permanente'],
  'Quelle est la différence avec un tatouage classique ?': ['profondeur d’implantation'],
  'Quel matériel est utilisé ?': ['matériel professionnel de tricopigmentation'],
  'Est-ce adapté aux femmes ?': ['réduire la transparence du cuir chevelu'],
  'Est-ce compatible avec une greffe capillaire ?': ['12 mois après l’opération'],
  'Combien de temps dure une séance ?': ['2 et 5 heures'],
  'Combien de séances faut-il ?': ['trois'],
  'Est-ce dangereux ou douloureux ?': ['inconfort léger'],
  'Comment vieillit la tricopigmentation ?': ['18 et 24 mois'],
  'Est-on obligé de se raser avant la séance ?': ['Pour un effet rasé', 'Pour un effet densité'],
  'Qu’en est-il de l’hygiène ?': ['consommables stériles à usage unique'],
  'Quelles consignes faut-il respecter après la séance ?': ['sèche pendant les 3 premiers jours'],
}

type LexicalNode = { type?: unknown; format?: unknown; text?: unknown; children?: LexicalNode[] }

// Removes the bold, and the italics that came with it, from each text node not in kept. Returns
// true if a text node changed.
const keepOnly = (node: LexicalNode, kept: string[]): boolean => {
  let changed = false
  if (
    node.type === 'text' &&
    typeof node.format === 'number' &&
    node.format & BOLD &&
    !(typeof node.text === 'string' && kept.includes(node.text))
  ) {
    node.format &= ~(BOLD | ITALIC)
    changed = true
  }
  for (const child of node.children || []) changed = keepOnly(child, kept) || changed
  return changed
}

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // A new site has no pages yet and gets the key facts from the starter content. Checking with
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

  const { hero, layout } = faq
  const changes = [
    hero.richText ? keepOnly(hero.richText.root, []) : false,
    ...layout.flatMap((block) =>
      block.blockType === 'faq'
        ? block.categories.flatMap(({ items }) =>
            items.map(({ answer, question }) => keepOnly(answer.root, keyFacts[question] || [])),
          )
        : [],
    ),
  ]
  if (!changes.some(Boolean)) return

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
