import type { Block } from 'payload'

export const FAQ: Block = {
  slug: 'faq',
  interfaceName: 'FAQBlock',
  labels: {
    singular: 'FAQ',
    plural: 'FAQ',
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
      label: 'Questions',
      labels: {
        singular: 'Question',
        plural: 'Questions',
      },
      minRows: 1,
      required: true,
      admin: {
        initCollapsed: true,
      },
      fields: [
        {
          name: 'question',
          type: 'text',
          label: 'Question',
          required: true,
        },
        {
          name: 'answer',
          type: 'textarea',
          label: 'Réponse',
          required: true,
        },
      ],
    },
  ],
}
