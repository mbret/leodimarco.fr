import type { Page } from '@/payload-types'

import { pageLink } from './links'
import { heading, paragraph, richText } from './richText'

// Call to action closing the starter pages, leading to the contact page
export const contactCta = (contact: Page) => ({
  blockType: 'cta' as const,
  richText: richText(
    heading('Envie d’en savoir plus ?', 'h3'),
    paragraph('Décrivez votre situation, je vous réponds pour en discuter.'),
  ),
  links: [pageLink(contact, 'Me contacter')],
})
