import type { Metadata } from 'next'

import { getServerSideURL } from './getURL'
import { SITE_NAME } from './siteName'

// Shown when a link to the site is shared; a page's own SEO image replaces it
export const DEFAULT_OG_IMAGE = {
  url: `${getServerSideURL()}/og-image.png`,
  width: 1200,
  height: 630,
  alt: 'Léo Di Marco, tricopigmentation à Pompey, près de Nancy',
}

const defaultOpenGraph: Metadata['openGraph'] = {
  type: 'website',
  images: [DEFAULT_OG_IMAGE],
  locale: 'fr_FR',
  siteName: SITE_NAME,
  title: SITE_NAME,
}

export const mergeOpenGraph = (og?: Metadata['openGraph']): Metadata['openGraph'] => {
  return {
    ...defaultOpenGraph,
    ...og,
  }
}
