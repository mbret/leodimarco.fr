import type { Adapter } from '@payloadcms/plugin-cloud-storage/types'
import { getStorageFilePath } from '@payloadcms/plugin-cloud-storage/utilities'
import { del, get, put } from '@vercel/blob'
import { isXmlMimeType, UPLOAD_CONTENT_SECURITY_POLICY } from 'payload/internal'

const CACHE_MAX_AGE = 60 * 60 * 24 * 365

/**
 * Payload storage adapter for a private Vercel Blob store.
 *
 * `@payloadcms/storage-vercel-blob` only supports public stores with a static
 * BLOB_READ_WRITE_TOKEN. Here `@vercel/blob` resolves credentials itself: on Vercel
 * it uses the deployment's OIDC token with BLOB_STORE_ID. Files are served through
 * Payload's access-controlled `/api/<collection>/file/<filename>` route.
 */
export const vercelBlobPrivateAdapter =
  (): Adapter =>
  ({ collection, prefix }) => ({
    name: 'vercel-blob-private',
    handleUpload: async ({ file, storageFilePath }) => {
      await put(storageFilePath, file.buffer, {
        access: 'private',
        addRandomSuffix: false,
        allowOverwrite: true,
        cacheControlMaxAge: CACHE_MAX_AGE,
        contentType: file.mimeType,
      })
    },
    handleDelete: async ({ storageFilePath }) => {
      await del(storageFilePath)
    },
    staticHandler: async (req, { doc, headers: incomingHeaders, params }) => {
      try {
        const pathname = await getStorageFilePath({
          clientUploadContext: params.clientUploadContext,
          collection,
          collectionPrefix: prefix,
          doc,
          filename: params.filename,
          req,
        })

        const result = await get(pathname, {
          access: 'private',
          ifNoneMatch: req.headers.get('if-none-match') ?? undefined,
        })

        if (!result) {
          return new Response(null, { status: 404, statusText: 'Not Found' })
        }

        const headers = new Headers(incomingHeaders)
        headers.set('Cache-Control', `public, max-age=${CACHE_MAX_AGE}`)
        headers.set('ETag', result.blob.etag)

        if (result.statusCode === 304) {
          return new Response(null, { headers, status: 304 })
        }

        headers.set('Content-Disposition', result.blob.contentDisposition)
        headers.set('Content-Length', String(result.blob.size))
        headers.set('Content-Type', result.blob.contentType)
        headers.set('Last-Modified', result.blob.uploadedAt.toUTCString())

        if (isXmlMimeType(result.blob.contentType)) {
          headers.set('Content-Security-Policy', UPLOAD_CONTENT_SECURITY_POLICY)
        }

        return new Response(result.stream, { headers })
      } catch (err) {
        req.payload.logger.error({ err, msg: 'Failed to read file from Vercel Blob' })

        return new Response('Internal Server Error', { status: 500 })
      }
    },
  })
