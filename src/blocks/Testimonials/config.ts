import type { Block } from 'payload'

import { link } from '@/fields/link'

export const Testimonials: Block = {
  slug: 'testimonials',
  interfaceName: 'TestimonialsBlock',
  labels: {
    singular: 'Avis clients',
    plural: 'Avis clients',
  },
  fields: [
    {
      name: 'heading',
      type: 'text',
      label: 'Titre',
    },
    {
      name: 'intro',
      type: 'textarea',
      label: 'Introduction',
    },
    {
      name: 'reviews',
      type: 'array',
      label: 'Avis',
      labels: {
        singular: 'Avis',
        plural: 'Avis',
      },
      admin: {
        initCollapsed: true,
        description: 'La section s’affiche sur le site dès qu’un avis est ajouté.',
      },
      fields: [
        {
          name: 'rating',
          type: 'number',
          label: 'Note (sur 5)',
          defaultValue: 5,
          min: 1,
          max: 5,
          required: true,
        },
        {
          name: 'text',
          type: 'textarea',
          label: 'Avis',
          required: true,
        },
        {
          name: 'author',
          type: 'text',
          label: 'Nom du client',
        },
      ],
    },
    // Link shown after the reviews, for example to all the Google reviews
    {
      name: 'enableLink',
      type: 'checkbox',
      label: 'Ajouter un lien',
    },
    link({
      appearances: false,
      overrides: {
        admin: {
          condition: (_data, siblingData) => Boolean(siblingData?.enableLink),
        },
      },
    }),
  ],
}
