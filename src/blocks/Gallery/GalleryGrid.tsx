'use client'

import { XIcon, ZoomInIcon } from 'lucide-react'
import React, { useCallback, useRef, useState } from 'react'

import type { Realisation } from '@/payload-types'

import { Media } from '@/components/Media'
import { getMediaUrl } from '@/utilities/getMediaUrl'
import { cn } from '@/utilities/ui'

import { PhotoZoom, pointIn, type ZoomPoint } from './PhotoZoom'

// Where the zoom opened, the frame's size, and the photo already shown, to fill the zoom at once
type OpenZoom = { at: ZoomPoint; frame: { width: number; height: number }; preview: string }

const viewLabels: Record<Realisation['photos'][number]['view'], string> = {
  face: 'Face',
  troisQuarts: '3/4',
  profil: 'Profil',
  dos: 'Dos',
  grosPlan: 'Gros plan',
}

// One client: their photos in a 4:5 frame, one at a time, and a chip per view to show another.
// On phones the frame also swipes from one view to the next. A tap or a click on the photo, or the
// zoom button, enlarges it in place, where a pinch or the mouse wheel zooms further.
const RealisationCard: React.FC<{ label: string; realisation: Realisation }> = ({
  label,
  realisation,
}) => {
  const { description, photos, title } = realisation
  const strip = useRef<HTMLDivElement>(null)
  const [shown, setShown] = useState(0)
  // The view a chip asked for, while the smooth scroll passes the views before it
  const target = useRef<number | null>(null)
  const [zoom, setZoom] = useState<OpenZoom | null>(null)
  const closeZoom = useCallback(() => setZoom(null), [])
  const shownImage = photos[shown]?.image
  const zoomable = typeof shownImage === 'object' && shownImage?.url ? shownImage : null
  // The 1920px size caps a large upload; a smaller upload has none and zooms on its original
  const zoomSrc =
    zoomable && getMediaUrl(zoomable.sizes?.xlarge?.url || zoomable.url, zoomable.updatedAt)

  const openZoom = (slide: Element | null | undefined, at: ZoomPoint) => {
    if (!(slide instanceof HTMLElement)) return
    setZoom({
      at,
      frame: { height: slide.clientHeight, width: slide.clientWidth },
      preview: slide.querySelector('img')?.currentSrc ?? '',
    })
  }

  const show = (index: number) => {
    setZoom(null)
    if (index === shown || !strip.current) return
    target.current = index
    setShown(index)
    strip.current.scrollLeft = index * strip.current.clientWidth
  }

  const sync = (element: HTMLDivElement) => {
    if (!element.clientWidth) return
    const index = Math.round(element.scrollLeft / element.clientWidth)
    if (target.current !== null) {
      if (index !== target.current) return
      target.current = null
    }
    if (index !== shown) setZoom(null)
    setShown(index)
  }

  return (
    <figure className="grid gap-3">
      <div className="relative">
        <div
          aria-label={label}
          className="flex aspect-[4/5] snap-x snap-mandatory overflow-x-auto overscroll-x-contain rounded-md border border-border [scrollbar-width:none] focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none motion-safe:scroll-smooth [&::-webkit-scrollbar]:hidden"
          onScroll={({ currentTarget }) => sync(currentTarget)}
          // A swipe can stop the scroll before it reaches the view a chip asked for
          onScrollEnd={({ currentTarget }) => {
            target.current = null
            sync(currentTarget)
          }}
          ref={strip}
          role="group"
          // Lets keyboard users scroll from one view to the next
          tabIndex={photos.length > 1 ? 0 : undefined}
        >
          {photos.map(({ id, image }) => (
            <div
              className={cn('relative w-full shrink-0 snap-center', zoomable && 'cursor-zoom-in')}
              key={id}
              onClick={(event) => {
                if (zoomable) {
                  openZoom(
                    event.currentTarget,
                    pointIn(event.currentTarget, event.clientX, event.clientY),
                  )
                }
              }}
            >
              <Media
                fill
                focalPoint
                imgClassName="object-cover"
                resource={image}
                size="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 480px"
              />
            </div>
          ))}
        </div>
        {zoom && zoomSrc && (
          <PhotoZoom
            at={zoom.at}
            frame={zoom.frame}
            objectPosition={
              typeof zoomable.focalX === 'number' && typeof zoomable.focalY === 'number'
                ? `${zoomable.focalX}% ${zoomable.focalY}%`
                : undefined
            }
            onClose={closeZoom}
            preview={zoom.preview}
            src={zoomSrc}
          />
        )}
        {zoomable && (
          <button
            aria-label="Zoom"
            aria-pressed={zoom !== null}
            className="absolute right-2 bottom-2 rounded-full border border-border bg-background/80 p-2 text-foreground backdrop-blur-sm transition-colors hover:bg-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            onClick={() => {
              if (zoom) setZoom(null)
              else openZoom(strip.current?.children[shown], { x: 50, y: 50 })
            }}
            type="button"
          >
            {zoom ? <XIcon className="size-4" /> : <ZoomInIcon className="size-4" />}
          </button>
        )}
      </div>
      <figcaption className="flex flex-wrap items-center justify-between gap-2">
        <span>
          <span className="font-medium">{title}</span>
          {description && (
            <span className="block text-sm text-muted-foreground">{description}</span>
          )}
        </span>
        {photos.length > 1 ? (
          <span aria-label="Vues" className="flex gap-1" role="group">
            {photos.map(({ id, view }, index) => (
              <button
                aria-pressed={index === shown}
                className={cn(
                  'rounded-full border px-3 py-1 text-xs transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                  index === shown
                    ? 'border-foreground bg-foreground text-background'
                    : 'border-border text-muted-foreground hover:text-foreground',
                )}
                key={id}
                onClick={() => show(index)}
                type="button"
              >
                {viewLabels[view]}
              </button>
            ))}
          </span>
        ) : (
          <span className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
            {viewLabels[photos[0].view]}
          </span>
        )}
      </figcaption>
    </figure>
  )
}

export const GalleryGrid: React.FC<{ realisations: Realisation[] }> = ({ realisations }) => (
  <ul className="grid gap-x-6 gap-y-12 sm:grid-cols-2">
    {realisations.map((realisation, index) => (
      <li key={realisation.id}>
        <RealisationCard
          label={`${realisation.title}, réalisation ${index + 1} sur ${realisations.length}`}
          realisation={realisation}
        />
      </li>
    ))}
  </ul>
)
