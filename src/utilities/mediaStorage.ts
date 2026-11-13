import type { S3StorageOptions } from '@payloadcms/storage-s3'

/**
 * Cloudflare R2 through its S3 API, read by the `s3Storage` adapter and by the media file route.
 * Without R2_BUCKET (local dev), Payload stores uploads in `public/media` instead.
 *
 * No `clientUploads` and no `prefix`: the media file route finds each file under its filename.
 */
export const mediaStorage = {
  bucket: process.env.R2_BUCKET || '',
  config: {
    endpoint: process.env.R2_ENDPOINT,
    region: 'auto',
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
    },
  },
  enabled: Boolean(process.env.R2_BUCKET),
} satisfies Pick<S3StorageOptions, 'bucket' | 'config' | 'enabled'>
