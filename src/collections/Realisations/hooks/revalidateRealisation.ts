import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidatePath } from 'next/cache'

import type { Realisation } from '../../../payload-types'

// Any page can hold a Gallery block, so refresh them all
const revalidateAllPages = () => revalidatePath('/', 'layout')

export const revalidateRealisation: CollectionAfterChangeHook<Realisation> = ({
  doc,
  req: { context },
}) => {
  if (!context.disableRevalidate) revalidateAllPages()
  return doc
}

export const revalidateRealisationDelete: CollectionAfterDeleteHook<Realisation> = ({
  doc,
  req: { context },
}) => {
  if (!context.disableRevalidate) revalidateAllPages()
  return doc
}
