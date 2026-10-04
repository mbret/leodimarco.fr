import type { Page } from '@/payload-types'

// Link to another page, as stored by the link field
export const pageLink = (page: Page, label: string, appearance?: 'default' | 'outline') => ({
  link: {
    type: 'reference' as const,
    reference: { relationTo: 'pages' as const, value: page.id },
    label,
    ...(appearance ? { appearance } : {}),
  },
})
