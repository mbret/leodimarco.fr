import React from 'react'

import { getCachedGlobal } from '@/utilities/getGlobals'
import { getServerSideURL } from '@/utilities/getURL'
import { DEFAULT_OG_IMAGE } from '@/utilities/mergeOpenGraph'
import { SITE_NAME } from '@/utilities/siteName'

// Describes the studio as a local business so search engines can show it in local results
export async function StudioStructuredData() {
  const studio = await getCachedGlobal('studio')()

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'HealthAndBeautyBusiness',
    name: SITE_NAME,
    description: 'Tricopigmentation (micropigmentation capillaire) à Pompey, près de Nancy',
    url: getServerSideURL(),
    image: DEFAULT_OG_IMAGE.url,
    areaServed: ['Pompey', 'Nancy', 'Meurthe-et-Moselle'],
    ...(studio?.phone && { telephone: studio.phone }),
    ...((studio?.street || studio?.city) && {
      address: {
        '@type': 'PostalAddress',
        streetAddress: studio.street || undefined,
        postalCode: studio.postalCode || undefined,
        addressLocality: studio.city || undefined,
        addressCountry: 'FR',
      },
    }),
    ...(studio?.socials?.length && { sameAs: studio.socials.map(({ url }) => url) }),
  }

  return (
    <script
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData).replace(/</g, '\\u003c'),
      }}
      type="application/ld+json"
    />
  )
}
