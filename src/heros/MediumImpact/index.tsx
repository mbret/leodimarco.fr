import React from 'react'

import type { Page } from '@/payload-types'

import { Breadcrumbs } from '@/components/Breadcrumbs'
import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'

// Title and text on a band in the green of the studio wall, with the photo beside them from the
// middle of the screen to its right edge. On phones the photo comes under the text.
export const MediumImpactHero: React.FC<Page['hero'] & { breadcrumbs?: Page['breadcrumbs'] }> = ({
  breadcrumbs,
  links,
  media,
  richText,
}) => {
  return (
    <div className="relative bg-studio">
      <div className="container flex md:min-h-[min(25vw,28rem)] md:items-center">
        <div className="py-10 md:w-1/2 md:py-12 md:pr-12">
          <Breadcrumbs breadcrumbs={breadcrumbs} />
          {richText && <RichText data={richText} enableGutter={false} />}
          {Array.isArray(links) && links.length > 0 && (
            <ul className="mt-6 flex flex-wrap gap-4">
              {links.map(({ link }, i) => {
                return (
                  <li key={i}>
                    <CMSLink {...link} />
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
      {media && typeof media === 'object' && (
        <Media
          className="relative aspect-[3/2] md:absolute md:inset-y-0 md:right-0 md:left-1/2 md:aspect-auto"
          fill
          focalPoint
          imgClassName="object-cover"
          priority
          resource={media}
          size="(min-width: 768px) 50vw, 100vw"
        />
      )}
    </div>
  )
}
