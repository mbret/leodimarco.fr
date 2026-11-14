export const MEDIA_CACHE_TAG_PARAM = 'v'

/**
 * For a bare `/api/media/file/<filename>` URL. Nothing can invalidate it, so a replaced file must
 * reach visitors within a day.
 */
export const MEDIA_DAY_CACHE_CONTROL =
  'public, max-age=86400, s-maxage=86400, stale-while-revalidate=2592000'

/** Safe because a replaced file gets a new `updatedAt`, so a new URL: the bytes behind a tagged URL never change. */
export const MEDIA_IMMUTABLE_CACHE_CONTROL =
  'public, max-age=31536000, s-maxage=31536000, immutable'

const isServedFile = (response: Response) => response.ok || response.status === 304

/** Gives a served file that was asked for by cache tag the year-long header. */
export const withMediaCacheControl = (request: Request, response: Response): Response => {
  const tagged = new URL(request.url).searchParams.has(MEDIA_CACHE_TAG_PARAM)

  if (!tagged || !isServedFile(response)) return response

  const headers = new Headers(response.headers)
  headers.set('Cache-Control', MEDIA_IMMUTABLE_CACHE_CONTROL)

  return new Response(response.body, {
    headers,
    status: response.status,
    statusText: response.statusText,
  })
}
