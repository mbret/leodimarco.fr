/**
 * The query parameter that carries a media URL's cache tag: the document's `updatedAt`.
 *
 * `getMediaUrl` writes it and the media file route reads it. If one side renames it alone, every
 * upload falls back to the collection's one-day cache window. `mediaCaching.int.spec.ts` checks
 * that both sides agree.
 */
export const MEDIA_CACHE_TAG_PARAM = 'v'

/**
 * A replaced file gets a new `updatedAt`, so a new URL. The bytes behind a tagged URL never
 * change, and caches can keep them for a year without revalidation.
 */
export const MEDIA_IMMUTABLE_CACHE_CONTROL =
  'public, max-age=31536000, s-maxage=31536000, immutable'

/** Statuses that must have no body. */
const BODILESS_STATUSES = new Set([101, 204, 205, 304])

const isServedFile = (response: Response) => response.ok || response.status === 304

/**
 * Gives a served file that was asked for by cache tag the year-long header.
 *
 * This runs in the route, because only the route sees the request and the response together.
 * The collection's `modifyResponseHeaders` sees the response alone, so it cannot tell a tagged
 * URL from a bare `/api/media/file/<filename>`. Nothing can invalidate a bare URL, so it keeps
 * the collection's short window. A 404, an error or a redirect is returned unchanged.
 */
export const withMediaCacheControl = (request: Request, response: Response): Response => {
  const tagged = new URL(request.url).searchParams.has(MEDIA_CACHE_TAG_PARAM)

  if (!tagged || !isServedFile(response)) return response

  const headers = new Headers(response.headers)
  headers.set('Cache-Control', MEDIA_IMMUTABLE_CACHE_CONTROL)

  return new Response(BODILESS_STATUSES.has(response.status) ? null : response.body, {
    headers,
    status: response.status,
    statusText: response.statusText,
  })
}
