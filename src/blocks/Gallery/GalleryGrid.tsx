'use client'

import { ZoomInIcon } from 'lucide-react'
import React, { useRef, useState } from 'react'

import type { Realisation } from '@/payload-types'

import { Media } from '@/components/Media'
import { getMediaUrl } from '@/utilities/getMediaUrl'
import { cn } from '@/utilities/ui'

import { PhotoViewer, type ViewerPhoto } from './PhotoViewer'

const viewLabels: Record<Realisation['photos'][number]['view'], string> = {
  face: 'Face',
  troisQuarts: '3/4',
  profil: 'Profil',
  dos: 'Dos',
  grosPlan: 'Gros plan',
}

// One client: their photos in a 4:5 frame, one at a time, and a chip per view to show another.
// On phones the frame also swipes from one view to the next. A tap or a click on the photo, or the
// zoom button, opens the photos in the viewer, where a pinch or the mouse wheel zooms.
const RealisationCard: React.FC<{ label: string; realisation: Realisation }> = ({
  label,
  realisation,
}) => {
  const { description, photos, title } = realisation
  const strip = useRef<HTMLDivElement>(null)
  const [shown, setShown] = useState(0)
  // The view a chip asked for, while the smooth scroll passes the views before it
  const target = useRef<number | null>(null)
  // The photos as the viewer shows them, from the size the card loaded, while it is open
  const [viewer, setViewer] = useState<ViewerPhoto[] | null>(null)

  const openViewer = () => {
    const slides = [...(strip.current?.children ?? [])]
    setViewer(
      // In the card's order, so that a view's index is the same in both
      photos.map(({ id, image, view }, index) => {
        const media = typeof image === 'object' ? image : null
        return {
          id: id ?? String(index),
          alt: media?.alt ?? '',
          label: viewLabels[view],
          preview: slides[index]?.querySelector('img')?.currentSrc ?? '',
          // The 1920px size caps a large upload; a smaller upload has none and shows its original
          src: getMediaUrl(media?.sizes?.xlarge?.url || media?.url, media?.updatedAt),
        }
      }),
    )
  }

  const show = (index: number) => {
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
    setShown(index)
  }

  // The viewer covered the card, so its view changes at once rather than with a smooth scroll
  const closeViewer = (index: number) => {
    setViewer(null)
    target.current = null
    setShown(index)
    const element = strip.current
    if (!element) return
    element.style.scrollBehavior = 'auto'
    element.scrollLeft = index * element.clientWidth
    element.style.scrollBehavior = ''
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
              className="relative w-full shrink-0 cursor-zoom-in snap-center"
              key={id}
              onClick={openViewer}
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
        <button
          aria-label="Agrandir les photos"
          className="absolute right-2 bottom-2 rounded-full border border-border bg-background/80 p-2 text-foreground backdrop-blur-sm transition-colors hover:bg-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          onClick={openViewer}
          type="button"
        >
          <ZoomInIcon className="size-4" />
        </button>
        {viewer && (
          <PhotoViewer onClose={closeViewer} photos={viewer} start={shown} title={title} />
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
