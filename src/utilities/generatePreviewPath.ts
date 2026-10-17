import { PreviewSearchParams } from '@/app/(frontend)/next/preview/route'
import { PayloadRequest, CollectionSlug } from 'payload'

const collectionPrefixMap: Partial<Record<CollectionSlug, string>> = {
  pages: '',
}

type Props = {
  collection: keyof typeof collectionPrefixMap
  // Path of the document on the site, such as /prestations/effet-rase
  path: string | null
  req: PayloadRequest
}

export const generatePreviewPath = ({ collection, path }: Props) => {
  if (!path) {
    return null
  }

  // Encode to support slugs with special characters
  const encodedPath = path.split('/').map(encodeURIComponent).join('/')

  const encodedParams = new URLSearchParams({
    path: `${collectionPrefixMap[collection]}${encodedPath}`,
    previewSecret: process.env.PREVIEW_SECRET || '',
  } satisfies PreviewSearchParams)

  const url = `/next/preview?${encodedParams.toString()}`

  return url
}
