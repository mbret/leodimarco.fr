import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'

import type { GalleryBlock as GalleryBlockProps } from '@/payload-types'

import { BlockHeading } from '@/components/BlockHeading'

import { GalleryGrid } from './GalleryGrid'

export const GalleryBlock: React.FC<GalleryBlockProps> = async ({
  enableLink,
  heading,
  layout,
  limit,
  link,
}) => {
  const payload = await getPayload({ config: configPromise })

  const { docs: realisations } = await payload.find({
    collection: 'realisations',
    depth: 1,
    limit: limit || 0,
    pagination: false,
    sort: '_order',
  })

  return (
    <div className="container">
      <BlockHeading enableLink={enableLink} heading={heading} link={link} />
      {realisations.length > 0 ? (
        <GalleryGrid realisations={realisations} row={layout === 'row'} />
      ) : (
        <p className="text-muted-foreground">Les réalisations arrivent bientôt.</p>
      )}
    </div>
  )
}
