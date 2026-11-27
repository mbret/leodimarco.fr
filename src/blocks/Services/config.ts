import type { Block } from 'payload'

import { link } from '@/fields/link'

export const Services: Block = {
  slug: 'services',
  interfaceName: 'ServicesBlock',
  labels: {
    singular: 'Prestations',
    plural: 'Prestations',
  },
  fields: [
    {
      name: 'heading',
      type: 'text',
      label: 'Titre',
    },
    {
      name: 'layout',
      type: 'select',
      label: 'Disposition',
      defaultValue: 'cards',
      options: [
        { label: 'Cartes', value: 'cards' },
        { label: 'Dessins en points', value: 'drawings' },
      ],
    },
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
      name: 'items',
      type: 'array',
      label: 'Prestations',
      labels: {
        singular: 'Prestation',
        plural: 'Prestations',
      },
      minRows: 1,
      required: true,
      admin: {
        initCollapsed: true,
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          label: 'Nom',
          required: true,
        },
        {
          name: 'description',
          type: 'textarea',
          label: 'Description',
        },
        {
          name: 'illustration',
          type: 'select',
          label: 'Dessin',
          required: true,
          options: [
            { label: 'Effet rasé', value: 'shaved' },
            { label: 'Effet densité', value: 'density' },
            { label: 'Camouflage de cicatrice', value: 'scar' },
          ],
          admin: {
            condition: (_data, _siblingData, { blockData }) => blockData?.layout === 'drawings',
            description: 'Le dessin au-dessus du nom. Tout le dessin mène au lien.',
          },
        },
        {
          name: 'price',
          type: 'text',
          label: 'Tarif',
          admin: {
            description: 'Texte libre, par exemple « À partir de 80 € » ou « Sur devis ».',
          },
        },
        // Button at the bottom of the card, usually to the service's own page
        {
          name: 'enableLink',
          type: 'checkbox',
          label: 'Ajouter un bouton',
        },
        link({
          overrides: {
            admin: {
              condition: (_data, siblingData) => Boolean(siblingData?.enableLink),
            },
          },
        }),
      ],
    },
  ],
}
