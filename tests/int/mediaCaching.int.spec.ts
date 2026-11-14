import { describe, expect, it } from 'vitest'

import { Media } from '@/collections/Media'
import { getMediaUrl } from '@/utilities/getMediaUrl'
import { MEDIA_DAY_CACHE_CONTROL, withMediaCacheControl } from '@/utilities/mediaCacheTag'

const REVISION = '2026-01-01T00:00:00.000Z'
const DAY = 60 * 60 * 24

const collectionCacheControl = (): string | null =>
  (Media.upload as { modifyResponseHeaders: (args: { headers: Headers }) => Headers })
    .modifyResponseHeaders({ headers: new Headers() })
    .get('Cache-Control')

const seconds = (cacheControl: string | null, directive: string): number => {
  const match = cacheControl?.match(new RegExp(`${directive}=(\\d+)`))

  return match ? Number(match[1]) : 0
}

describe('a media URL without a cache tag', () => {
  it('gets the one-day window from the collection', () => {
    expect(collectionCacheControl()).toBe(MEDIA_DAY_CACHE_CONTROL)
  })

  it('may be kept by the browser and the CDN for a day', () => {
    const cacheControl = MEDIA_DAY_CACHE_CONTROL

    expect(cacheControl).toContain('public')
    expect(cacheControl).not.toMatch(/max-age=0|no-store|must-revalidate/)
    expect(seconds(cacheControl, 'max-age')).toBeGreaterThanOrEqual(DAY)
    expect(seconds(cacheControl, 's-maxage')).toBeGreaterThanOrEqual(DAY)
  })

  // Nothing can invalidate a bare URL, so a replaced file must reach visitors in a few days
  it('is not promised forever', () => {
    const cacheControl = MEDIA_DAY_CACHE_CONTROL

    expect(cacheControl).not.toContain('immutable')
    expect(seconds(cacheControl, 'max-age')).toBeLessThanOrEqual(7 * DAY)
  })
})

describe('a media URL with a cache tag', () => {
  const MEDIA_URL = 'https://example.test/api/media/file/photo.webp'

  const served = (status = 200) =>
    new Response(status === 304 ? null : 'bytes', {
      headers: { 'Cache-Control': MEDIA_DAY_CACHE_CONTROL, 'Content-Type': 'image/webp' },
      status,
    })

  const answer = (url: string, response: Response = served()) =>
    withMediaCacheControl(new Request(url), response)

  const tagged = getMediaUrl(MEDIA_URL, REVISION)

  it('changes when the document changes', () => {
    expect(getMediaUrl(MEDIA_URL, REVISION)).not.toBe(
      getMediaUrl(MEDIA_URL, '2026-06-01T00:00:00.000Z'),
    )
  })

  it('may be kept for a year without revalidation', () => {
    const cacheControl = answer(tagged).headers.get('Cache-Control')

    expect(seconds(cacheControl, 'max-age')).toBeGreaterThanOrEqual(365 * DAY)
    expect(seconds(cacheControl, 's-maxage')).toBeGreaterThanOrEqual(365 * DAY)
    expect(cacheControl).toContain('immutable')
  })

  it('keeps the file and its other headers', async () => {
    const response = answer(tagged)

    expect(response.headers.get('Content-Type')).toBe('image/webp')
    expect(await response.text()).toBe('bytes')
  })

  it('gets the year on a 304 too', () => {
    const response = answer(tagged, served(304))

    expect(response.status).toBe(304)
    expect(response.headers.get('Cache-Control')).toContain('immutable')
  })

  it('gets nothing extra for a file that was not served', () => {
    const response = answer(tagged, new Response(null, { status: 404 }))

    expect(response.headers.get('Cache-Control')).toBeNull()
  })

  it('leaves a bare URL on the collection’s window', () => {
    expect(answer(MEDIA_URL).headers.get('Cache-Control')).toBe(MEDIA_DAY_CACHE_CONTROL)
  })
})
