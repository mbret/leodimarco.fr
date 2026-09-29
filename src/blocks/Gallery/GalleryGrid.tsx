'use client'

import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import React, { useState } from 'react'

import type { Realisation } from '@/payload-types'

import { Media } from '@/components/Media'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export const GalleryGrid: React.FC<{ realisations: Realisation[] }> = ({ realisations }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const current = openIndex === null ? null : realisations[openIndex]
  const count = realisations.length

  const step = (delta: number) =>
    setOpenIndex((index) => (index === null ? null : (index + delta + count) % count))

  return (
    <>
      <ul className="grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-4">
        {realisations.map((realisation, index) => (
          <li key={realisation.id}>
            <button
              className="relative block aspect-square w-full overflow-hidden rounded-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              onClick={() => setOpenIndex(index)}
              type="button"
            >
              <span className="sr-only">{realisation.title}</span>
              <Media
                fill
                imgClassName="object-cover transition-transform hover:scale-105"
                resource={realisation.image}
                size="(max-width: 768px) 50vw, 33vw"
              />
            </button>
          </li>
        ))}
      </ul>

      <Dialog open={current !== null} onOpenChange={(open) => !open && setOpenIndex(null)}>
        {current && (
          <DialogContent
            className="sm:max-w-3xl"
            onKeyDown={(event) => {
              if (event.key === 'ArrowLeft') step(-1)
              if (event.key === 'ArrowRight') step(1)
            }}
          >
            <DialogHeader>
              <DialogTitle>{current.title}</DialogTitle>
              <DialogDescription className={current.description ? undefined : 'sr-only'}>
                {current.description || current.title}
              </DialogDescription>
            </DialogHeader>
            <div className="relative h-[70vh]">
              <Media fill imgClassName="object-contain" resource={current.image} size="100vw" />
            </div>
            {count > 1 && (
              <div className="flex justify-between">
                <Button onClick={() => step(-1)} size="icon" variant="outline">
                  <ChevronLeftIcon />
                  <span className="sr-only">Photo précédente</span>
                </Button>
                <Button onClick={() => step(1)} size="icon" variant="outline">
                  <ChevronRightIcon />
                  <span className="sr-only">Photo suivante</span>
                </Button>
              </div>
            )}
          </DialogContent>
        )}
      </Dialog>
    </>
  )
}
