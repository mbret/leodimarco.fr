'use client'

import React, { useRef, useState } from 'react'

import type { Realisation } from '@/payload-types'

import { Media } from '@/components/Media'
import { cn } from '@/utilities/ui'

const viewLabels: Record<Realisation['photos'][number]['view'], string> = {
  face: 'Face',
  troisQuarts: '3/4',
  profil: 'Profil',
  dos: 'Dos',
  grosPlan: 'Gros plan',
}

// One client: their photos in a 4:5 frame, one at a time, and a chip per view to show another.
// On phones the frame also swipes from one view to the next.
const RealisationCard: React.FC<{ realisation: Realisation }> = ({ realisation }) => {
  const { description, photos, title } = realisation
  const strip = useRef<HTMLDivElement>(null)
  const [shown, setShown] = useState(0)

  const show = (index: number) => {
    setShown(index)
    if (strip.current) strip.current.scrollLeft = index * strip.current.clientWidth
  }

  return (
    <figure className="grid gap-3">
      <div
        aria-label={title}
        className="flex aspect-[4/5] snap-x snap-mandatory overflow-x-auto overscroll-x-contain rounded-md border border-border [scrollbar-width:none] focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none motion-safe:scroll-smooth [&::-webkit-scrollbar]:hidden"
        onScroll={({ currentTarget: { clientWidth, scrollLeft } }) => {
          if (clientWidth) setShown(Math.round(scrollLeft / clientWidth))
        }}
        ref={strip}
        role="group"
        // Lets keyboard users scroll from one view to the next
        tabIndex={0}
      >
        {photos.map(({ id, image }) => (
          <div className="relative w-full shrink-0 snap-center" key={id}>
            <Media
              fill
              focalPoint
              imgClassName="object-cover"
              resource={image}
              size="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
            />
          </div>
        ))}
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
  <ul className="grid gap-x-4 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
    {realisations.map((realisation) => (
      <li key={realisation.id}>
        <RealisationCard realisation={realisation} />
      </li>
    ))}
  </ul>
)
