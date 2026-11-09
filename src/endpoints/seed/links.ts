import type { Page } from '@/payload-types'

// Léo's number, for WhatsApp and calls, and a direct message on Instagram: the ways to reach him
// besides the contact form
export const PHONE = '+33744429488'
export const PHONE_LABEL = '07 44 42 94 88'
export const PHONE_URL = `tel:${PHONE}`
export const WHATSAPP_URL = `https://wa.me/${PHONE.slice(1)}`
export const INSTAGRAM_MESSAGE_URL = 'https://ig.me/m/leodimarcotricopigmentation'

// Link to another page, as stored by the link field
export const pageLink = (page: Page, label: string, appearance?: 'default' | 'outline') => ({
  link: {
    type: 'reference' as const,
    reference: { relationTo: 'pages' as const, value: page.id },
    label,
    ...(appearance ? { appearance } : {}),
  },
})

// Link to another site, opened in a new tab
export const externalLink = (url: string, label: string, appearance?: 'default' | 'outline') => ({
  link: {
    type: 'custom' as const,
    url,
    newTab: true,
    label,
    ...(appearance ? { appearance } : {}),
  },
})
