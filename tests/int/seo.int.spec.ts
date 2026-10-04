import { cleanup, render, screen } from '@testing-library/react'
import React from 'react'
import { afterEach, describe, expect, it } from 'vitest'

import { ServicesBlock } from '@/blocks/Services/Component'
import { generateMeta } from '@/utilities/generateMeta'
import { getServerSideURL } from '@/utilities/getURL'
import { DEFAULT_OG_IMAGE } from '@/utilities/mergeOpenGraph'

afterEach(cleanup)

describe('SEO', () => {
  it('shares pages without an SEO image with the default image', async () => {
    const meta = await generateMeta({ doc: { meta: { title: 'FAQ' } }, path: '/faq' })

    expect(meta.openGraph?.images).toEqual([DEFAULT_OG_IMAGE])
  })

  it('shares pages with their own SEO image, cropped for Open Graph', async () => {
    const meta = await generateMeta({
      doc: {
        meta: {
          image: {
            id: 1,
            url: '/api/media/file/photo.jpg',
            sizes: { og: { url: '/api/media/file/photo-1200x630.jpg' } },
            createdAt: '',
            updatedAt: '',
          },
        },
      },
      path: '/',
    })

    expect(meta.openGraph?.images).toEqual([
      { url: `${getServerSideURL()}/api/media/file/photo-1200x630.jpg` },
    ])
  })

  it('makes service names headings below the block heading', () => {
    const items = [{ id: '1', title: 'Densification' }]

    render(React.createElement(ServicesBlock, { blockType: 'services', items }))
    expect(screen.getByRole('heading', { level: 2, name: 'Densification' })).toBeTruthy()
    cleanup()

    render(
      React.createElement(ServicesBlock, { blockType: 'services', heading: 'Prestations', items }),
    )
    expect(screen.getByRole('heading', { level: 3, name: 'Densification' })).toBeTruthy()
  })
})
