import type { Metadata } from 'next'

import type { Media, Page, Config } from '../payload-types'

import { mergeOpenGraph } from './mergeOpenGraph'
import { getServerSideURL } from './getURL'
import { SITE_NAME } from './siteName'

const getImageURL = (image?: Media | Config['db']['defaultIDType'] | null) => {
  if (!image || typeof image !== 'object') return undefined

  const url = image.sizes?.og?.url || image.url

  return url ? getServerSideURL() + url : undefined
}

export const generateMeta = async (args: {
  doc: Partial<Page> | null
  path: string
}): Promise<Metadata> => {
  const { doc, path } = args

  const ogImage = getImageURL(doc?.meta?.image)

  const title = doc?.meta?.title ? doc?.meta?.title + ' | ' + SITE_NAME : SITE_NAME

  return {
    alternates: {
      canonical: path,
    },
    description: doc?.meta?.description,
    openGraph: mergeOpenGraph({
      description: doc?.meta?.description || '',
      images: ogImage
        ? [
            {
              url: ogImage,
            },
          ]
        : undefined,
      title,
      url: path,
    }),
    title,
  }
}
