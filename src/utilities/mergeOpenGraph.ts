import type { Metadata } from 'next'

import { SITE_NAME } from './siteName'

const defaultOpenGraph: Metadata['openGraph'] = {
  type: 'website',
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
