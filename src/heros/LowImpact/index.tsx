import React from 'react'

import type { Page } from '@/payload-types'

import { Breadcrumbs } from '@/components/Breadcrumbs'
import { DotField } from '@/components/DotField'
import { CMSLink } from '@/components/Link'
import RichText from '@/components/RichText'
import { cn } from '@/utilities/ui'

export const LowImpactHero: React.FC<Page['hero'] & { breadcrumbs?: Page['breadcrumbs'] }> = ({
  breadcrumbs,
  dotPattern,
  links,
  richText,
}) => {
  return (
    <div className="container md:mt-16">
      <Breadcrumbs breadcrumbs={breadcrumbs} />
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
    </div>
  )
}
