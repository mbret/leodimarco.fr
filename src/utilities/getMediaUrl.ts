import { MEDIA_CACHE_TAG_PARAM } from './mediaCacheTag'

/**
 * Adds the cache tag to a media URL.
 * @param url The URL from the media document, e.g. `/api/media/file/image.webp`
 * @param cacheTag The document's `updatedAt`, so a replaced file gets a new URL
 */
export const getMediaUrl = (url: string | null | undefined, cacheTag?: string | null): string => {
  if (!url) return ''

  if (!cacheTag) return url

  return `${url}?${MEDIA_CACHE_TAG_PARAM}=${encodeURIComponent(cacheTag)}`
}
