import type { Block } from 'payload'

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
    {
      name: 'limit',
      type: 'number',
      label: 'Nombre maximum de photos',
      min: 1,
      admin: {
        description: 'Laisser vide pour afficher toutes les réalisations.',
      },
    },
  ],
}
