import React from 'react'

import type { CallToActionBlock as CTABlockProps } from '@/payload-types'

import RichText from '@/components/RichText'
import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import { StudioBand } from '@/components/StudioBand'

export const CallToActionBlock: React.FC<CTABlockProps> = ({
  facts,
  links,
  media,
  richText,
  style,
}) => {
  if (style === 'band') {
    return (
      <StudioBand media={media}>
        {richText && <RichText className="mb-0" data={richText} enableGutter={false} />}
        {facts && facts.length > 0 && (
          <ul className="mt-8 grid gap-4 border-t border-border pt-5 sm:grid-cols-3">
            {facts.map(({ id, label, value }) => (
              <li key={id}>
                <p className="font-heading text-lg font-semibold">{value}</p>
                {label && <p className="text-sm text-muted-foreground">{label}</p>}
              </li>
            ))}
          </ul>
        )}
        {links && links.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-4">
            {links.map(({ link }, i) => (
              <CMSLink key={i} size="lg" {...link} />
            ))}
          </div>
        )}
      </StudioBand>
    )
  }

  return (
    <div className="container">
      <div className="bg-card rounded border-border border p-4 flex flex-col gap-8 md:flex-row md:justify-between md:items-center">
        <div className="max-w-[48rem] flex items-center gap-4 md:gap-6">
          {media && (
            <Media
              className="shrink-0"
              focalPoint
              imgClassName="size-16 rounded-full border border-border object-cover md:size-20"
              resource={media}
              size="80px"
            />
          )}
          {richText && <RichText className="mb-0" data={richText} enableGutter={false} />}
        </div>
        <div className="flex flex-col gap-4">
          {(links || []).map(({ link }, i) => {
            return <CMSLink key={i} size="lg" {...link} />
          })}
        </div>
      </div>
    </div>
  )
}
