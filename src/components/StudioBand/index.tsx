import React from 'react'

import type { Media as MediaType } from '@/payload-types'

import { Media } from '@/components/Media'
import { cn } from '@/utilities/ui'

// Text on a band in the green of the studio wall, with its photo beside it from the middle of the
// screen to its right edge. On phones the photo comes under the text.
export const StudioBand: React.FC<{
  children: React.ReactNode
  media?: MediaType | number | null
  priority?: boolean
}> = ({ children, media, priority }) => {
  const photo = typeof media === 'object' ? media : null

  return (
    <div className="relative studio-band">
      <div className="container flex md:min-h-[min(25vw,28rem)] md:items-center">
        <div className={cn('py-10 md:py-12', photo ? 'md:w-1/2 md:pr-12' : 'max-w-[48rem]')}>
          {children}
        </div>
      </div>
      {photo && (
        <Media
          className="relative aspect-[3/2] md:absolute md:inset-y-0 md:right-0 md:left-1/2 md:aspect-auto"
          fill
          focalPoint
          imgClassName="object-cover"
          priority={priority}
          resource={photo}
          size="(min-width: 768px) 50vw, 100vw"
        />
      )}
    </div>
  )
}
