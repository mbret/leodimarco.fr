import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-vercel-postgres'

// The studio is in Pompey, near Nancy: reword the pages that located it in Nancy
const replacements: [string, string][] = [
  ['à Nancy (54)', 'à Pompey (54), près de Nancy'],
  ['à Nancy', 'à Pompey, près de Nancy'],
]

const reword = <T>(value: T): T => {
  let json = JSON.stringify(value)
  for (const [from, to] of replacements) json = json.split(from).join(to)
  return JSON.parse(json)
}

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  const { docs: pages } = await payload.find({
    collection: 'pages',
    depth: 0,
    limit: 0,
    pagination: false,
    req,
  })

  for (const page of pages) {
    const data = { hero: page.hero, layout: page.layout, meta: page.meta }
    const reworded = reword(data)
    if (JSON.stringify(reworded) === JSON.stringify(data)) continue

    await payload.update({
      collection: 'pages',
      id: page.id,
      data: reworded,
      depth: 0,
      req,
      // Migrations run before the build, which renders the new content anyway
      context: { disableRevalidate: true },
    })
  }
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // Content change only
}
