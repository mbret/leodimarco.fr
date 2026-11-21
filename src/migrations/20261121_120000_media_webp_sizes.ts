import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3'
import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-vercel-postgres'

import type { Media } from '@/payload-types'

import { mediaStorage } from '../utilities/mediaStorage'

/** The `srcset` sizes in `src/collections/Media.ts`. */
const LADDER = ['thumbnail', 'small', 'medium', 'large', 'xlarge'] as const

/** The width of `xlarge`. `withoutEnlargement` caps it at the upload's own width. */
const TOP_WIDTH = 1920

/**
 * The types Payload makes sizes for and stores as uploaded. It makes sizes for GIF, WebP and TIFF
 * too, but it also re-encodes those originals, so this migration leaves them alone.
 */
const REBUILT_TYPES = new Set(['image/jpeg', 'image/png', 'image/avif'])

type Pending = Media & { filename: string; mimeType: string; width: number }

/** Whether the document's type is rebuilt here, and it does not have the widest WebP size yet. */
const needsSizes = (doc: Media): doc is Pending => {
  if (!doc.filename || typeof doc.width !== 'number') return false
  if (!REBUILT_TYPES.has(doc.mimeType ?? '')) return false

  const widest = LADDER.map((name) => doc.sizes?.[name]).reduce(
    (top, size) =>
      size?.mimeType === 'image/webp' && size.width ? Math.max(top, size.width) : top,
    0,
  )

  return widest < Math.min(TOP_WIDTH, doc.width)
}

// Gives uploads made before the WebP sizes their WebP sizes, so `ImageMedia` offers them. Payload
// makes the sizes again when a document gets its file back, so each original is read from R2 and
// handed back under the same name.
// Each document is saved on its own, outside the migration's transaction: the storage adapter
// writes and deletes files in R2 as it saves, and a rollback could not undo those.
// A document that fails keeps its old sizes and shows its full-size original, and the deploy goes on.
// Without R2 (local dev and CI), there are no production files to rebuild.
export async function up({ payload }: MigrateUpArgs): Promise<void> {
  if (!mediaStorage.enabled) {
    payload.logger.info('No R2 bucket: the media sizes are not rebuilt')
    return
  }

  const bucket = new S3Client(mediaStorage.config)
  const { docs } = await payload.find({
    collection: 'media',
    depth: 0,
    limit: 0,
    pagination: false,
  })

  for (const doc of docs.filter(needsSizes)) {
    try {
      const object = await bucket.send(
        new GetObjectCommand({ Bucket: mediaStorage.bucket, Key: doc.filename }),
      )
      const data = Buffer.from((await object.Body?.transformToByteArray()) ?? [])

      await payload.update({
        collection: 'media',
        id: doc.id,
        // On update, Payload takes the focal point from the incoming data only. Without it, the
        // `og` and `square` crops are cut around the centre.
        data: { focalX: doc.focalX, focalY: doc.focalY },
        file: { data, mimetype: doc.mimeType, name: doc.filename, size: data.byteLength },
        // Without this, Payload sees the document's own file as a name conflict and renames it,
        // which breaks every URL to the old name
        overwriteExistingFiles: true,
      })

      payload.logger.info(`Rebuilt the media sizes of ${doc.filename}`)
    } catch (err) {
      payload.logger.error({ err, msg: `Could not rebuild the media sizes of ${doc.filename}` })
    }
  }
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // Content change only. The WebP sizes stay; older code ignores them.
}
