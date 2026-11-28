import type { Field } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { linkGroup } from '@/fields/linkGroup'

export const hero: Field = {
  name: 'hero',
  type: 'group',
  fields: [
    {
      name: 'type',
      type: 'select',
      defaultValue: 'lowImpact',
      label: 'Type',
      options: [
        {
          label: 'None',
          value: 'none',
        },
        {
          label: 'High Impact',
          value: 'highImpact',
        },
        {
          label: 'Bandeau vert avec photo',
          value: 'mediumImpact',
        },
        {
          label: 'Low Impact',
          value: 'lowImpact',
        },
        {
          label: 'Photo à côté du titre',
          value: 'photo',
        },
      ],
      required: true,
    },
    {
      name: 'dotPattern',
      type: 'checkbox',
      label: 'Motif de points',
      admin: {
        condition: (_, { type } = {}) => type === 'lowImpact',
        description:
          'Des points discrets à côté du titre et en bas à gauche de la page, différents à chaque visite, qui apparaissent point par point.',
      },
    },
    {
      name: 'richText',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [
            ...rootFeatures,
            HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
            FixedToolbarFeature(),
            InlineToolbarFeature(),
          ]
        },
      }),
      label: false,
      admin: {
        description:
          'Photo à côté du titre : le titre (H1) s’affiche en petit au-dessus, et le sous-titre (H2) en grand, ses mots en gras plus foncés.',
      },
    },
    linkGroup({
      overrides: {
        maxRows: 2,
      },
    }),
    {
      name: 'media',
      type: 'upload',
      admin: {
        condition: (_, { type } = {}) => ['highImpact', 'mediumImpact', 'photo'].includes(type),
        description:
          'Photo à côté du titre : la photo s’affiche entière, à la forme de son recadrage dans Médias. Une photo large fait un bandeau sur les téléphones.',
      },
      relationTo: 'media',
      // Images only: the media library also holds videos, which would not fill the hero
      filterOptions: { mimeType: { contains: 'image' } },
      required: true,
    },
    {
      name: 'highlights',
      type: 'array',
      label: 'Repères',
      labels: { singular: 'Repère', plural: 'Repères' },
      maxRows: 4,
      admin: {
        condition: (_, { type } = {}) => type === 'photo',
        description: 'Quelques mots chacun, sur une ligne sous les boutons.',
      },
      fields: [{ name: 'text', type: 'text', label: 'Texte', required: true }],
    },
  ],
  label: false,
}
