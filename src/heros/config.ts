import type { Field, UploadFieldSingleValidation } from 'payload'
import { upload } from 'payload/shared'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { linkGroup } from '@/fields/linkGroup'

// The photo makes the High Impact hero and the green band; a Low Impact hero can do without
const requirePhoto: UploadFieldSingleValidation = (value, options) => {
  const { type } = (options.siblingData ?? {}) as { type?: string }
  return upload(value, { ...options, required: type === 'highImpact' || type === 'mediumImpact' })
}

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
      ],
      required: true,
    },
    {
      name: 'dotPattern',
      type: 'checkbox',
      label: 'Motif de points',
      admin: {
        condition: (_, { media, type } = {}) => type === 'lowImpact' && !media,
        description:
          'Des points discrets à côté du titre et en bas à gauche de la page, différents à chaque visite, qui apparaissent point par point. Pas avec une photo.',
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
        condition: (_, { type } = {}) => ['highImpact', 'mediumImpact', 'lowImpact'].includes(type),
        description:
          'Obligatoire pour High Impact et Bandeau vert. Optionnelle pour Low Impact : la photo s’affiche à droite du titre, à la place du motif de points.',
      },
      relationTo: 'media',
      // Images only: the media library also holds videos, which would not fill the hero
      filterOptions: { mimeType: { contains: 'image' } },
      validate: requirePhoto,
    },
  ],
  label: false,
}
