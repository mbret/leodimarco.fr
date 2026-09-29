import type { Block } from 'payload'

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
          name: 'price',
          type: 'text',
          label: 'Tarif',
          admin: {
            description: 'Texte libre, par exemple « À partir de 80 € » ou « Sur devis ».',
          },
        },
      ],
    },
  ],
}
