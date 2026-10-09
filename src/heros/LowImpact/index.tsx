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
    <div className={cn('container md:mt-16', dotPattern && 'relative isolate')}>
      {/* Behind the text, reaching up into the page's top spacing */}
      {dotPattern && (
        <DotField
          className="absolute inset-0 -top-8 -z-10 overflow-hidden md:-top-32"
          variant="hero"
        />
      )}
      <Breadcrumbs breadcrumbs={breadcrumbs} />
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
  )
}
