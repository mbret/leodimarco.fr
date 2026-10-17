import type { Block } from 'payload'

export const KeyFacts: Block = {
  slug: 'keyFacts',
  interfaceName: 'KeyFactsBlock',
  labels: {
    singular: 'Repères',
    plural: 'Repères',
  },
  fields: [
    {
      name: 'items',
      type: 'array',
      label: 'Repères',
      labels: {
        singular: 'Repère',
        plural: 'Repères',
      },
      minRows: 1,
      required: true,
      admin: {
        description: 'Affichés en cartes, quatre par ligne sur ordinateur.',
      },
      fields: [
        {
          name: 'value',
          type: 'text',
          label: 'Valeur',
          required: true,
          admin: {
            description: 'Courte, par exemple « 29 ans ».',
          },
        },
        {
          name: 'label',
          type: 'text',
          label: 'Légende',
          required: true,
        },
      ],
    },
  ],
}
