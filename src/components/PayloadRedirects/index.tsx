import type React from 'react'

import { getCachedRedirects } from '@/utilities/getRedirects'
import { pagePath } from '@/utilities/pagePath'
import { notFound, redirect } from 'next/navigation'

interface Props {
  disableNotFound?: boolean
  url: string
}

/* This component helps us with SSR based dynamic redirects */
export const PayloadRedirects: React.FC<Props> = async ({ disableNotFound, url }) => {
  const redirects = await getCachedRedirects()()

  const redirectItem = redirects.find((redirect) => redirect.from === url)

  if (redirectItem) {
    if (redirectItem.to?.url) {
      redirect(redirectItem.to.url)
    }

    // Redirects are fetched with depth 1, so the referenced page is populated
    const page = redirectItem.to?.reference?.value

    if (typeof page === 'object' && page?.slug) {
      redirect(pagePath(page))
    }
  }

  if (disableNotFound) return null

  notFound()
}
