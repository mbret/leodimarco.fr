import type { CollectionConfig } from 'payload'

import { anyone } from '../../access/anyone'
import { authenticated } from '../../access/authenticated'
import { revalidateRealisation, revalidateRealisationDelete } from './hooks/revalidateRealisation'

// Healed results shown by the Gallery block, one per client with a photo per view, in the order set
// by drag and drop in the admin
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
    defaultColumns: ['title', 'description', 'updatedAt'],
    useAsTitle: 'title',
  },
  defaultPopulate: {
    title: true,
    description: true,
    photos: true,
  },
  orderable: true,
  fields: [
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
    {
      name: 'photos',
      type: 'array',
      label: 'Photos',
      labels: { singular: 'Photo', plural: 'Photos' },
      required: true,
      admin: {
        description:
          'Une photo par vue. La première s’affiche dans la galerie, les autres au choix de la vue.',
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'view',
              type: 'select',
              label: 'Vue',
              required: true,
              options: [
                { label: 'Face', value: 'face' },
                { label: '3/4', value: 'troisQuarts' },
                { label: 'Profil', value: 'profil' },
                { label: 'Dos', value: 'dos' },
                { label: 'Gros plan', value: 'grosPlan' },
              ],
            },
            {
              name: 'image',
              type: 'upload',
              label: 'Photo',
              relationTo: 'media',
              required: true,
              filterOptions: { mimeType: { contains: 'image' } },
            },
          ],
        },
      ],
    },
  ],
  hooks: {
    afterChange: [revalidateRealisation],
    afterDelete: [revalidateRealisationDelete],
  },
}
