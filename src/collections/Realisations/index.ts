import type { CollectionConfig } from 'payload'

import { anyone } from '../../access/anyone'
import { authenticated } from '../../access/authenticated'
import { revalidateRealisation, revalidateRealisationDelete } from './hooks/revalidateRealisation'

// Before/after results shown by the Gallery block, in the order set by drag and drop in the admin
export const Realisations: CollectionConfig<'realisations'> = {
  slug: 'realisations',
  labels: {
    singular: 'Réalisation',
    plural: 'Réalisations',
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  admin: {
    defaultColumns: ['image', 'title', 'updatedAt'],
    useAsTitle: 'title',
  },
  defaultPopulate: {
    title: true,
    description: true,
    image: true,
    before: true,
  },
  orderable: true,
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'before',
          type: 'upload',
          label: 'Photo avant',
          relationTo: 'media',
          admin: {
            description:
              'Optionnel. Si elle est renseignée, la galerie affiche l’avant et l’après.',
          },
        },
        {
          name: 'image',
          type: 'upload',
          label: 'Photo après',
          relationTo: 'media',
          required: true,
        },
      ],
    },
    {
      name: 'title',
      type: 'text',
      label: 'Titre',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
      admin: {
        description: 'Optionnel : zone traitée, nombre de séances…',
      },
    },
  ],
  hooks: {
    afterChange: [revalidateRealisation],
    afterDelete: [revalidateRealisationDelete],
  },
}
