import type { RequiredDataFromCollectionSlug } from 'payload'

import type { Form } from '@/payload-types'

import { formatPhone } from '../../utilities/formatPhone'
import { externalLink, INSTAGRAM_MESSAGE_URL, PHONE, STUDIO_ADDRESS, WHATSAPP_URL } from './links'
import { heading, paragraph, richText } from './richText'

type PageData = RequiredDataFromCollectionSlug<'pages'>

const { street, postalCode, city } = STUDIO_ADDRESS
const DIRECTIONS_URL = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${street}, ${postalCode} ${city}`)}`

// Photos of the Contact page, by their id in the media collection, named after where they go
export type ContactPhotos = {
  // The studio, on the green band beside the title
  hero: number
  // Léo's face, round on the card that asks for photos
  contactCard: number
  // A client from the front, the side and the back: the views to send
  views: [number, number, number]
  // The studio, beside its address
  studio: number
}

// Contact page content. Without photos, as on a new site, the dot pattern stays beside the title.
// Used by the seed and by the migration that brings existing sites up to date.
export const contactPageData = ({
  contactForm,
  photos,
}: {
  contactForm: number | Form
  photos?: ContactPhotos
}): PageData => {
  const intro = richText(
    heading('Contact'),
    paragraph(
      'Studio privé à Pompey, sur rendez-vous. Le plus simple : envoyez-moi quelques photos, je vous réponds avec un premier avis.',
    ),
  )

  const heroLinks = [
    externalLink(WHATSAPP_URL, 'Écrire sur WhatsApp'),
    // Opens the phone app, so in the same tab
    {
      link: {
        type: 'custom' as const,
        url: `tel:${PHONE}`,
        label: formatPhone(PHONE),
        appearance: 'outline' as const,
      },
    },
  ]

  const studio = richText(
    heading('Le studio', 'h2'),
    paragraph(`${street}\n${postalCode} ${city}, près de Nancy`),
    paragraph('Sur rendez-vous uniquement.'),
  )
  const itinerary = {
    enableLink: true,
    ...externalLink(DIRECTIONS_URL, 'Itinéraire', 'outline'),
  }

  const views: PageData['layout'] = photos
    ? [
        {
          blockType: 'content',
          columns: photos.views.map((media) => ({ size: 'oneThird', media })),
        },
      ]
    : []

  return {
    slug: 'contact',
    title: 'Contact',
    _status: 'published',
    hero: photos
      ? { type: 'mediumImpact', media: photos.hero, richText: intro, links: heroLinks }
      : { type: 'lowImpact', dotPattern: true, richText: intro, links: heroLinks },
    layout: [
      {
        blockType: 'cta',
        media: photos?.contactCard,
        richText: richText(
          heading('Les photos à m’envoyer', 'h2'),
          paragraph(
            'De face, de côté et de dos, cheveux courts si possible, en lumière naturelle.',
          ),
        ),
        links: [
          externalLink(WHATSAPP_URL, 'WhatsApp'),
          externalLink(INSTAGRAM_MESSAGE_URL, 'Instagram'),
        ],
      },
      ...views,
      {
        blockType: 'formBlock',
        form: contactForm,
        enableIntro: true,
        introContent: richText(heading('Vous préférez écrire ?', 'h2')),
      },
      {
        blockType: 'content',
        columns: photos
          ? [
              { size: 'half', richText: studio, ...itinerary },
              { size: 'half', media: photos.studio },
            ]
          : [{ size: 'full', richText: studio, ...itinerary }],
      },
    ],
    meta: {
      title: 'Contact et rendez-vous',
      description:
        'Prenez rendez-vous pour une tricopigmentation à Pompey, près de Nancy : studio privé, sur rendez-vous. Envoyez quelques photos pour un premier avis.',
    },
  }
}
