import type { RequiredDataFromCollectionSlug } from 'payload'

import { SITE_NAME } from '@/utilities/siteName'

import { heading, paragraph, richText } from './richText'

// Shown on the homepage until the starter pages are created from the admin dashboard
export const homeStatic: RequiredDataFromCollectionSlug<'pages'> = {
  slug: 'home',
  _status: 'published',
  hero: {
    type: 'lowImpact',
    richText: richText(heading(SITE_NAME), paragraph('Site en construction.')),
  },
  title: 'Accueil',
  layout: [],
}
