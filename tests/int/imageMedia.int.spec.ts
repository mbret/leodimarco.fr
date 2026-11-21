import { cleanup, render } from '@testing-library/react'
import React from 'react'
import { afterEach, describe, expect, it } from 'vitest'

import type { Media } from '@/payload-types'

import { ImageMedia } from '@/components/Media/ImageMedia'
import { MEDIA_CACHE_TAG_PARAM } from '@/utilities/mediaCacheTag'

import nextConfig from '../../next.config'

const REVISION = '2026-01-01T00:00:00.000Z'
const TAG = `${MEDIA_CACHE_TAG_PARAM}=${encodeURIComponent(REVISION)}`

const size = (name: string, width: number, mimeType = 'image/webp') => ({
  url: `/api/media/file/photo-${name}.${mimeType === 'image/webp' ? 'webp' : 'jpg'}`,
  width,
  height: Math.round(width * 1.25),
  mimeType,
  filesize: width * 10,
  filename: `photo-${name}.webp`,
})

/** The WebP sizes Payload makes for an upload wider than 1920px. */
const allSizes = {
  thumbnail: size('thumbnail', 300),
  small: size('small', 600),
  medium: size('medium', 900),
  large: size('large', 1400),
  xlarge: size('xlarge', 1920),
}

const upload = (overrides: Partial<Media> = {}): Media => ({
  id: 1,
  alt: 'Effet rasé',
  createdAt: REVISION,
  updatedAt: REVISION,
  url: '/api/media/file/photo.jpg',
  mimeType: 'image/jpeg',
  width: 2400,
  height: 3000,
  sizes: allSizes,
  ...overrides,
})

const renderImage = (props: React.ComponentProps<typeof ImageMedia>) => {
  const { container } = render(React.createElement(ImageMedia, props))

  return {
    img: container.querySelector('img')!,
    source: container.querySelector('source'),
  }
}

afterEach(cleanup)

describe('the image sizes a browser can pick from', () => {
  it('offers every WebP size, narrowest first, on a typed source', () => {
    const { img, source } = renderImage({ resource: upload() })

    expect(source?.getAttribute('type')).toBe('image/webp')
    expect(source?.getAttribute('srcset')).toBe(
      [
        `/api/media/file/photo-thumbnail.webp?${TAG} 300w`,
        `/api/media/file/photo-small.webp?${TAG} 600w`,
        `/api/media/file/photo-medium.webp?${TAG} 900w`,
        `/api/media/file/photo-large.webp?${TAG} 1400w`,
        `/api/media/file/photo-xlarge.webp?${TAG} 1920w`,
      ].join(', '),
    )
    expect(img.getAttribute('srcset')).toBeNull()
  })

  it('keeps the original on the image, for a browser without WebP', () => {
    const { img } = renderImage({ resource: upload() })

    expect(img.getAttribute('src')).toBe(`/api/media/file/photo.jpg?${TAG}`)
  })

  it('never sends an image through the Next.js optimizer', () => {
    expect(nextConfig.images?.unoptimized).toBe(true)
  })

  it('offers only the sizes that exist', () => {
    const { source } = renderImage({
      resource: upload({ width: 500, sizes: { thumbnail: size('thumbnail', 300) } }),
    })

    expect(source?.getAttribute('srcset')).toBe(`/api/media/file/photo-thumbnail.webp?${TAG} 300w`)
  })

  it('offers no JPEG size made before the sizes became WebP', () => {
    const { img, source } = renderImage({
      resource: upload({
        sizes: {
          thumbnail: size('thumbnail', 300, 'image/jpeg'),
          medium: size('medium', 900, 'image/jpeg'),
        },
      }),
    })

    expect(source).toBeNull()
    expect(img.getAttribute('src')).toBe(`/api/media/file/photo.jpg?${TAG}`)
  })

  it('never offers the same width twice', () => {
    const { source } = renderImage({
      resource: upload({
        width: 1400,
        sizes: {
          thumbnail: size('thumbnail', 300),
          large: size('large', 1400),
          xlarge: size('xlarge', 1400),
        },
      }),
    })

    expect(source?.getAttribute('srcset')).toBe(
      [
        `/api/media/file/photo-thumbnail.webp?${TAG} 300w`,
        `/api/media/file/photo-large.webp?${TAG} 1400w`,
      ].join(', '),
    )
  })
})

describe('the width the browser picks with', () => {
  it('is the viewport by default', () => {
    const { img, source } = renderImage({ resource: upload() })

    expect(img.getAttribute('sizes')).toBe('100vw')
    expect(source?.getAttribute('sizes')).toBe('100vw')
  })

  it('is the width a caller gives, on the source and the image', () => {
    const { img, source } = renderImage({ resource: upload(), size: '80px' })

    expect(img.getAttribute('sizes')).toBe('80px')
    expect(source?.getAttribute('sizes')).toBe('80px')
  })
})

describe('the image element', () => {
  it('has the upload’s alt text and dimensions', () => {
    const { img } = renderImage({ resource: upload() })

    expect(img.getAttribute('alt')).toBe('Effet rasé')
    expect(img.getAttribute('width')).toBe('2400')
    expect(img.getAttribute('height')).toBe('3000')
  })

  it('covers its positioned ancestor with `fill`, without dimensions', () => {
    const { img } = renderImage({ resource: upload(), fill: true })

    expect(img.style.position).toBe('absolute')
    expect(img.style.width).toBe('100%')
    expect(img.style.height).toBe('100%')
    expect(img.getAttribute('width')).toBeNull()
  })

  it('keeps the focal point in view on request', () => {
    const { img } = renderImage({
      resource: upload({ focalX: 38, focalY: 35 }),
      fill: true,
      focalPoint: true,
    })

    expect(img.style.objectPosition).toBe('38% 35%')
    expect(img.style.position).toBe('absolute')
  })

  it('loads lazily unless it has priority', () => {
    expect(renderImage({ resource: upload() }).img.getAttribute('loading')).toBe('lazy')
    cleanup()

    const { img } = renderImage({ resource: upload(), priority: true })

    expect(img.getAttribute('loading')).toBe('eager')
    expect(img.getAttribute('fetchpriority')).toBe('high')
  })

  it('serves a static import as it is', () => {
    const { img, source } = renderImage({
      src: { src: '/_next/static/media/logo.1234.png', width: 200, height: 100 },
    })

    expect(source).toBeNull()
    expect(img.getAttribute('src')).toBe('/_next/static/media/logo.1234.png')
  })
})
