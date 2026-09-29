import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'

import type { GalleryBlock as GalleryBlockProps } from '@/payload-types'

import { GalleryGrid } from './GalleryGrid'

export const GalleryBlock: React.FC<GalleryBlockProps> = async ({ heading, limit }) => {
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
      {heading && <h2 className="mb-8 text-3xl font-semibold">{heading}</h2>}
      {realisations.length > 0 ? (
        <GalleryGrid realisations={realisations} />
      ) : (
        <p className="text-muted-foreground">Les réalisations arrivent bientôt.</p>
      )}
    </div>
  )
}
