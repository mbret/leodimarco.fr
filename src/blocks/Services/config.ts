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
    // Link beside the title, for example to all the services
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
          options: [
            { label: 'Effet rasé', value: 'shaved' },
            { label: 'Effet densité', value: 'density' },
            { label: 'Camouflage de cicatrice', value: 'scar' },
          ],
          admin: {
            description:
              'Optionnel : un dessin en points au-dessus du nom. La prestation s’affiche alors sans cadre, et tout le dessin mène au lien.',
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
