import type { Block } from 'payload'

import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
  UnorderedListFeature,
} from '@payloadcms/richtext-lexical'

import { link } from '@/fields/link'

export const FAQ: Block = {
  slug: 'faq',
  interfaceName: 'FAQBlock',
  labels: {
    singular: 'FAQ',
    plural: 'FAQ',
  },
  fields: [
    {
      name: 'categories',
      type: 'array',
      label: 'Catégories',
      labels: {
        singular: 'Catégorie',
        plural: 'Catégories',
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
          label: 'Titre',
          required: true,
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
              type: 'richText',
              label: 'Réponse',
              required: true,
              editor: lexicalEditor({
                features: ({ rootFeatures }) => [
                  ...rootFeatures,
                  UnorderedListFeature(),
                  FixedToolbarFeature(),
                  InlineToolbarFeature(),
                ],
              }),
            },
          ],
        },
        // Button shown after the category's questions
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
