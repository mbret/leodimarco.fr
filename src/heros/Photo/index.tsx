import React from 'react'

import type { Page } from '@/payload-types'

import { Breadcrumbs } from '@/components/Breadcrumbs'
import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'

// The photo beside the text from tablets, and under it across the whole width on phones. The page
// title shows as a small label above the subtitle (globals.css).
export const PhotoHero: React.FC<Page['hero'] & { breadcrumbs?: Page['breadcrumbs'] }> = ({
  breadcrumbs,
  highlights,
  links,
  media,
  richText,
}) => (
  <div className="container">
    <Breadcrumbs breadcrumbs={breadcrumbs} />
    <div className="md:grid md:grid-cols-[1.1fr_0.9fr] md:items-center md:gap-10 lg:gap-16">
      <div className="max-w-[48rem]">
        {richText && <RichText className="photo-hero" data={richText} enableGutter={false} />}
        {Array.isArray(links) && links.length > 0 && (
          <ul className="mt-8 flex flex-wrap gap-4">
            {links.map(({ link }, i) => (
              <li key={i}>
                <CMSLink {...link} size="lg" />
              </li>
            ))}
          </ul>
        )}
        {highlights && highlights.length > 0 && (
          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 border-t border-border pt-5 text-sm text-muted-foreground">
            {highlights.map(({ id, text }) => (
              <li className="flex items-center gap-2" key={id}>
                <span aria-hidden className="size-1.5 rounded-full bg-full-stop" />
                {text}
              </li>
            ))}
          </ul>
        )}
      </div>
      {media && typeof media === 'object' && (
        <Media
          className="relative mt-10 aspect-[4/5] overflow-hidden rounded-xl md:mt-0"
          fill
          focalPoint
          imgClassName="object-cover"
          priority
          resource={media}
          size="(min-width: 768px) 420px, 100vw"
        />
      )}
    </div>
  </div>
)
