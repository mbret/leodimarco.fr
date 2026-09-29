import type { GlobalConfig } from 'payload'

import { revalidateStudio } from './hooks/revalidateStudio'

// Contact details and social links, shown in the footer and given to search engines
export const Studio: GlobalConfig = {
  slug: 'studio',
  label: 'Coordonnées du studio',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'phone',
      type: 'text',
      label: 'Téléphone',
      admin: {
        description: 'Au format international, par exemple +33612345678.',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'street',
          type: 'text',
          label: 'Adresse',
        },
        {
          name: 'postalCode',
          type: 'text',
          label: 'Code postal',
        },
        {
          name: 'city',
          type: 'text',
          label: 'Ville',
        },
      ],
    },
    {
      name: 'socials',
      type: 'array',
      label: 'Réseaux sociaux',
      labels: {
        singular: 'Réseau',
        plural: 'Réseaux',
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'platform',
              type: 'select',
              label: 'Réseau',
              options: [
                { label: 'Instagram', value: 'instagram' },
                { label: 'Facebook', value: 'facebook' },
                { label: 'YouTube', value: 'youtube' },
              ],
              required: true,
            },
            {
              name: 'url',
              type: 'text',
              label: 'Lien',
              required: true,
            },
          ],
        },
      ],
    },
  ],
  hooks: {
    afterChange: [revalidateStudio],
  },
}
