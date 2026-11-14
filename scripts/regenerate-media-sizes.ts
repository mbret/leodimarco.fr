/**
 * Rebuilds the generated sizes of uploads made before the sizes became WebP.
 *
 *   NODE_ENV=production DRY_RUN=1 pnpm payload run scripts/regenerate-media-sizes.ts
 *   NODE_ENV=production LIMIT=1 pnpm payload run scripts/regenerate-media-sizes.ts
 *
 * Run it with production's POSTGRES_URL and R2_* variables. Without R2_BUCKET, Payload writes the
 * new sizes to this machine's disk while the production rows expect them in the bucket.
 *
 * NODE_ENV=production is required. Without it, Payload pushes the local schema to the database
 * and adds a `dev` row to `payload_migrations`. The next deploy's `payload migrate` then stops
 * at a prompt.
 *
 * `imageSizes` applies only to new uploads. Older uploads keep sizes in their original format, which
 * `ImageMedia` does not offer, so they show their full-size original until this script runs.
 * Payload makes the sizes again when a document gets its file back, so the script downloads each
 * original from SOURCE_ORIGIN and gives it back. It skips a document that already has its sizes,
 * so a rerun is safe.
 *
 * After a LIMIT run, open the documents in the admin and make sure their filenames did not change.
 *
 * Redeploy afterwards: pages rendered before the run still offer only the originals.
 */
import config from '@payload-config'

import type { Media } from '@/payload-types'

import { mediaStorage } from '@/utilities/mediaStorage'

const SOURCE_ORIGIN = process.env.SOURCE_ORIGIN ?? 'https://www.leodimarco.fr'

const DRY_RUN = process.env.DRY_RUN === '1'
const LIMIT = process.env.LIMIT ? Number(process.env.LIMIT) : undefined

/** The `srcset` sizes in `src/collections/Media.ts`. */
const LADDER = ['thumbnail', 'small', 'medium', 'large', 'xlarge'] as const

/** The width of `xlarge`. `withoutEnlargement` caps it at the upload's own width. */
const TOP_WIDTH = 1920

/** The raster types Payload makes sizes for (its `canResizeImage`). */
const RESIZABLE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/tiff',
  'image/avif',
])

type Pending = Media & { filename: string; mimeType: string; url: string; width: number }

/** Whether Payload makes sizes for the document, and it does not have the widest WebP size yet. */
const needsSizes = (doc: Media): doc is Pending => {
  if (!doc.filename || !doc.url || typeof doc.width !== 'number') return false
  if (!RESIZABLE_TYPES.has(doc.mimeType ?? '')) return false

  const widest = LADDER.map((name) => doc.sizes?.[name]).reduce(
    (top, size) =>
      size?.mimeType === 'image/webp' && size.width ? Math.max(top, size.width) : top,
    0,
  )

  return widest < Math.min(TOP_WIDTH, doc.width)
}

const fetchOriginal = async (doc: Pending) => {
  const url = new URL(doc.url, SOURCE_ORIGIN).toString()
  const res = await fetch(url)

  if (!res.ok) throw new Error(`${res.status} fetching ${url}`)

  const data = Buffer.from(await res.arrayBuffer())

  return {
    data,
    mimetype: doc.mimeType,
    name: doc.filename,
    size: data.byteLength,
  }
}

const main = async () => {
  if (process.env.NODE_ENV !== 'production') {
    throw new Error('Set NODE_ENV=production, so Payload does not push the schema in dev mode.')
  }

  const { getPayload } = await import('payload')

  const payload = await getPayload({ config })

  const { docs } = await payload.find({
    collection: 'media',
    depth: 0,
    limit: 0,
    pagination: false,
  })

  const pending = docs.filter(needsSizes)
  const todo = LIMIT ? pending.slice(0, LIMIT) : pending

  console.log(`media documents       : ${docs.length}`)
  console.log(`nothing to do         : ${docs.length - pending.length}`)
  console.log(`to regenerate         : ${todo.length}${LIMIT ? ` (LIMIT=${LIMIT})` : ''}`)
  console.log(`originals read from   : ${SOURCE_ORIGIN}`)
  console.log(`sizes written to      : ${mediaStorage.enabled ? 'R2' : 'local disk'}`)

  if (DRY_RUN) {
    todo.forEach((doc) => console.log(`  would regenerate ${doc.filename}`))
    console.log('\nDRY_RUN=1, nothing written.')

    return
  }

  let done = 0
  let failed = 0

  // One at a time: each document is a download, seven resizes and eight writes to the bucket
  for (const doc of todo) {
    try {
      await payload.update({
        collection: 'media',
        id: doc.id,
        data: {},
        file: await fetchOriginal(doc),
        // Without this, Payload sees the document's own file as a name conflict and renames it,
        // which breaks every URL to the old name
        overwriteExistingFiles: true,
      })

      done++
      console.log(`  regenerated ${doc.filename}`)
    } catch (error) {
      failed++
      console.error(`  FAILED ${doc.filename}: ${error instanceof Error ? error.message : error}`)
    }
  }

  console.log(`\nDone: ${done} regenerated, ${failed} failed.`)

  if (done > 0) {
    console.log('\nRedeploy now: pages rendered before this run still offer only the originals.')
  }
}

// Payload keeps the Postgres pool open, so the script ends the process itself
try {
  await main()
  process.exit(0)
} catch (error) {
  console.error(error)
  process.exit(1)
}
