import React from 'react'

import { colorFullStop } from '@/components/FullStop'
import { CMSLink } from '@/components/Link'

export const BlockHeading: React.FC<{
  enableLink?: boolean | null
  heading?: string | null
  link?: React.ComponentProps<typeof CMSLink>
}> = ({ enableLink, heading, link }) => {
  if (!heading && !enableLink) return null

  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
      {heading && <h2 className="text-3xl font-semibold">{colorFullStop(heading)}</h2>}
      {enableLink && link && (
        <CMSLink
          {...link}
          appearance="inline"
          className="font-medium underline underline-offset-4"
        />
      )}
    </div>
  )
}
