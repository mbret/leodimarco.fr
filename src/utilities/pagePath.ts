import type { Page } from '@/payload-types'

// Path of a page on the site. The home page is the root, and a page with a parent sits under it
// (/prestations/effet-rase), as recorded in the breadcrumbs that the nested docs plugin keeps up to
// date. Pages saved before the plugin have no breadcrumbs yet and sit at the root.
export const pagePath = ({
  breadcrumbs,
  slug,
}: {
  breadcrumbs?: Page['breadcrumbs']
  slug?: string | null
}): string => {
  if (slug === 'home') return '/'
  return breadcrumbs?.at(-1)?.url || `/${slug}`
}
