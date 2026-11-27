import React from 'react'

import type { Page } from '@/payload-types'

import { Breadcrumbs } from '@/components/Breadcrumbs'
import { DotField } from '@/components/DotField'
import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'
import { cn } from '@/utilities/ui'

// The dots beside the title, and at the end of the page. A photo takes their place.
export const showsDotPattern = (hero?: Page['hero'] | null) =>
  hero?.type === 'lowImpact' && Boolean(hero.dotPattern) && !hero.media

export const LowImpactHero: React.FC<Page['hero'] & { breadcrumbs?: Page['breadcrumbs'] }> = (
  props,
) => {
  const { breadcrumbs, links, media, richText } = props
  const dotPattern = showsDotPattern(props)
  const photo = typeof media === 'object' ? media : null

  return (
    <div className="container md:mt-16">
      <Breadcrumbs breadcrumbs={breadcrumbs} />
      {/* The photo sits beside the text on large screens, where a long title still fits on one
          line, and under it on smaller ones */}
      <div className={cn(photo && 'lg:grid lg:grid-cols-[3fr_2fr] lg:items-center lg:gap-12')}>
        {/* The dots are placed from the title, so a breadcrumb above it does not move them */}
        <div className={cn(dotPattern && 'relative isolate')}>
          {/* Behind the text, reaching up into the page's top spacing. As tall as the patch at the
              end of the page whatever the length of the intro, so every page shows the same patch */}
          {dotPattern && (
            <DotField
              className="absolute inset-x-0 -top-8 -z-10 h-60 overflow-hidden md:-top-32"
              variant="hero"
            />
          )}
          <div className="max-w-[48rem]">
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
        {photo && (
          <Media
            className="relative mt-10 aspect-[4/5] max-w-md overflow-hidden rounded-xl lg:mt-0 lg:max-w-none"
            fill
            focalPoint
            imgClassName="object-cover"
            priority
            resource={photo}
            size="(min-width: 1024px) 384px, (min-width: 448px) 448px, 100vw"
          />
        )}
      </div>
    </div>
  )
}
