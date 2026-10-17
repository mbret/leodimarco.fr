import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidatePath, revalidateTag } from 'next/cache'

import type { Page } from '../../../payload-types'
import { pagePath } from '../../../utilities/pagePath'

export const revalidatePage: CollectionAfterChangeHook<Page> = ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    const path = pagePath(doc)

    if (doc._status === 'published') {
      payload.logger.info(`Revalidating page at path: ${path}`)

      revalidatePath(path)
      revalidateTag('pages-sitemap', 'max')
    }

    // If the page was previously published, we need to revalidate the old path, also when the page
    // moved to another path
    const oldPath = previousDoc ? pagePath(previousDoc) : path
    if (previousDoc?._status === 'published' && (doc._status !== 'published' || oldPath !== path)) {
      payload.logger.info(`Revalidating old page at path: ${oldPath}`)

      revalidatePath(oldPath)
      revalidateTag('pages-sitemap', 'max')
    }
  }
  return doc
}

export const revalidateDelete: CollectionAfterDeleteHook<Page> = ({ doc, req: { context } }) => {
  if (!context.disableRevalidate) {
    revalidatePath(pagePath(doc))
    revalidateTag('pages-sitemap', 'max')
  }

  return doc
}
