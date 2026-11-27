import type { Block } from 'payload'

export const Steps: Block = {
  slug: 'steps',
  interfaceName: 'StepsBlock',
  labels: {
    singular: 'Étapes',
    plural: 'Étapes',
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
      label: 'Étapes',
      labels: { singular: 'Étape', plural: 'Étapes' },
      minRows: 2,
      maxRows: 5,
      required: true,
      admin: {
        initCollapsed: true,
        description: 'Dans l’ordre : elles sont numérotées et reliées par une ligne de points.',
      },
      fields: [
        {
          name: 'label',
          type: 'text',
          label: 'Quand',
          admin: { description: 'Optionnel, en petit au-dessus, par exemple « Au studio ».' },
        },
        { name: 'title', type: 'text', label: 'Titre', required: true },
        { name: 'text', type: 'textarea', label: 'Texte' },
      ],
    },
  ],
}
