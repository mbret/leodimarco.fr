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
        description: 'Par exemple des avis Google, recopiés ici. Trois avis remplissent une ligne.',
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
        {
          name: 'photo',
          type: 'upload',
          relationTo: 'media',
          // Images only: the media library also holds videos
          filterOptions: { mimeType: { contains: 'image' } },
          label: 'Photo du client',
          admin: {
            description: 'Avec son accord. Sans photo, l’avis montre l’initiale de son nom.',
          },
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
