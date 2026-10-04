import React from 'react'

import type { Page } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import RichText from '@/components/RichText'

export const LowImpactHero: React.FC<Page['hero']> = ({ links, richText }) => {
  return (
    <div className="container md:mt-16">
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
