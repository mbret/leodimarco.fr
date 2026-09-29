import type { CollectionConfig } from 'payload'

import { anyone } from '../../access/anyone'
import { authenticated } from '../../access/authenticated'
import { revalidateRealisation, revalidateRealisationDelete } from './hooks/revalidateRealisation'

// Tattoo photos shown by the Gallery block, in the order set by drag and drop in the admin
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
  },
  orderable: true,
  fields: [
    {
      name: 'image',
      type: 'upload',
      label: 'Photo',
      relationTo: 'media',
      required: true,
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
        description: 'Optionnel : style, emplacement, nombre de séances…',
      },
    },
  ],
  hooks: {
    afterChange: [revalidateRealisation],
    afterDelete: [revalidateRealisationDelete],
  },
}
