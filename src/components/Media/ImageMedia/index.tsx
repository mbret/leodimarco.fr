'use client'

import type { CSSProperties } from 'react'

import { cn } from '@/utilities/ui'
import React from 'react'

import type { Media as MediaType } from '@/payload-types'

import type { Props as MediaProps } from '../types'

import { getMediaUrl } from '@/utilities/getMediaUrl'

/**
 * `srcset` sizes from `src/collections/Media.ts`. `square` and `og` are crops of another shape, so
 * they cannot share a `srcset` with these.
 */
const LADDER = ['thumbnail', 'small', 'medium', 'large', 'xlarge'] as const

type GeneratedSize = NonNullable<NonNullable<MediaType['sizes']>[(typeof LADDER)[number]]>

const LADDER_TYPE = 'image/webp'

/**
 * The `<source>` declares WebP, so it leaves out sizes made before the sizes became WebP, until
 * `scripts/regenerate-media-sizes.ts` rebuilds them.
 */
const isUsable = (size: GeneratedSize | null | undefined): size is GeneratedSize =>
  Boolean(size?.url && size?.width && size?.mimeType === LADDER_TYPE)

const srcSetFor = (resource: MediaType) =>
  LADDER.map((name) => resource.sizes?.[name])
    .filter(isUsable)
    // An upload exactly as wide as a size gets that size twice: `xlarge` does not enlarge it
    .filter((size, i, all) => all.findIndex((other) => other.width === size.width) === i)
    .map((size) => `${getMediaUrl(size.url, resource.updatedAt)} ${size.width}w`)
    .join(', ')

const FILL_STYLE: CSSProperties = { height: '100%', inset: 0, position: 'absolute', width: '100%' }

export const ImageMedia: React.FC<MediaProps> = (props) => {
  const {
    alt: altFromProps,
    fill,
    focalPoint,
    pictureClassName,
    imgClassName,
    priority,
    resource,
    size: sizeFromProps,
    src: srcFromProps,
    loading: loadingFromProps,
  } = props

  let width: number | undefined
  let height: number | undefined
  let alt = altFromProps
  let src = ''
  let srcSet = ''
  let objectPosition: string | undefined

  if (srcFromProps) {
    // A static import already has a hashed name and its own size
    src = srcFromProps.src
    width = srcFromProps.width
    height = srcFromProps.height
  } else if (resource && typeof resource === 'object') {
    const {
      alt: altFromResource,
      focalX,
      focalY,
      height: fullHeight,
      url,
      width: fullWidth,
    } = resource

    width = fullWidth ?? undefined
    height = fullHeight ?? undefined
    alt = altFromResource || ''

    // Only on request: an image shown whole (object-contain) would move off centre
    if (focalPoint && typeof focalX === 'number' && typeof focalY === 'number') {
      objectPosition = `${focalX}% ${focalY}%`
    }

    src = getMediaUrl(url, resource.updatedAt)
    srcSet = srcSetFor(resource)
  }

  const loading = loadingFromProps ?? (priority ? 'eager' : 'lazy')

  // Callers that don't pass `size` render at full width
  const sizes = sizeFromProps ?? '100vw'

  const style: CSSProperties = {
    ...(fill ? FILL_STYLE : {}),
    ...(objectPosition ? { objectPosition } : {}),
  }

  return (
    <picture className={cn(pictureClassName)}>
      {srcSet && <source sizes={sizes} srcSet={srcSet} type={LADDER_TYPE} />}
      <img
        alt={alt || ''}
        className={cn(imgClassName)}
        decoding="async"
        fetchPriority={priority ? 'high' : undefined}
        height={!fill ? height : undefined}
        loading={loading}
        sizes={sizes}
        src={src}
        style={Object.keys(style).length ? style : undefined}
        width={!fill ? width : undefined}
      />
    </picture>
  )
}
