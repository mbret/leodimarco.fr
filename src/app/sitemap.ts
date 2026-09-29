import type { MetadataRoute } from 'next'

import config from '@payload-config'
import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'

import { getServerSideURL } from '@/utilities/getURL'

// Tagged so that publishing a page (see revalidatePage) refreshes the sitemap
const getPublishedPages = unstable_cache(
  async () => {
    const payload = await getPayload({ config })

    const { docs } = await payload.find({
      collection: 'pages',
      overrideAccess: false,
      draft: false,
      depth: 0,
      limit: 1000,
      pagination: false,
      where: {
        _status: {
          equals: 'published',
        },
      },
      select: {
        slug: true,
        updatedAt: true,
      },
    })

    return docs
  },
  ['pages-sitemap'],
  {
    tags: ['pages-sitemap'],
  },
)

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const url = getServerSideURL()
  const pages = await getPublishedPages()

  return pages
    .filter((page) => Boolean(page.slug))
    .map((page) => ({
      url: page.slug === 'home' ? `${url}/` : `${url}/${page.slug}`,
      lastModified: page.updatedAt,
    }))
}
