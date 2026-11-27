import type { Block } from 'payload'

import { link } from '@/fields/link'

export const Gallery: Block = {
  slug: 'gallery',
  interfaceName: 'GalleryBlock',
  labels: {
    singular: 'Galerie',
    plural: 'Galeries',
  },
  fields: [
    {
      name: 'heading',
      type: 'text',
      label: 'Titre',
    },
    // Link beside the title, for example to the whole gallery
    {
      name: 'enableLink',
      type: 'checkbox',
      label: 'Ajouter un lien à côté du titre',
    },
    link({
      appearances: false,
      overrides: {
        admin: {
          condition: (_data, siblingData) => Boolean(siblingData?.enableLink),
        },
      },
    }),
    {
      name: 'layout',
      type: 'select',
      label: 'Disposition',
      defaultValue: 'cards',
      options: [
        { label: 'Grandes photos, deux par ligne', value: 'cards' },
        { label: 'Petites photos, quatre par ligne', value: 'row' },
      ],
    },
    {
      name: 'limit',
      type: 'number',
      label: 'Nombre maximum de réalisations',
      min: 1,
      admin: {
        description: 'Laisser vide pour afficher toutes les réalisations.',
      },
    },
  ],
}
