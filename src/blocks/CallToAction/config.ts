import type { Block } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { linkGroup } from '../../fields/linkGroup'

export const CallToAction: Block = {
  slug: 'cta',
  interfaceName: 'CallToActionBlock',
  fields: [
    {
      name: 'style',
      type: 'select',
      label: 'Style',
      defaultValue: 'card',
      options: [
        { label: 'Encadré', value: 'card' },
        { label: 'Bandeau vert', value: 'band' },
      ],
      admin: {
        description:
          'Le bandeau vert, dans le vert du mur du studio, occupe toute la largeur de l’écran.',
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
    {
      name: 'media',
      type: 'upload',
      label: 'Photo',
      relationTo: 'media',
      // Images only: the media library also holds videos
      filterOptions: { mimeType: { contains: 'image' } },
      admin: {
        description:
          'Optionnelle. Encadré : une photo ronde à gauche du texte, par exemple votre portrait. Bandeau vert : la photo en grand à droite du texte, jusqu’au bord de l’écran.',
      },
    },
    // Short facts under the text of a band, such as « 29 ans » or the studio's town
    {
      name: 'facts',
      type: 'array',
      label: 'Repères',
      labels: { singular: 'Repère', plural: 'Repères' },
      maxRows: 4,
      admin: {
        condition: (_data, siblingData) => siblingData?.style === 'band',
        description: 'Bandeau vert : une valeur courte et sa légende, sur une ligne sous le texte.',
      },
      fields: [
        { name: 'value', type: 'text', label: 'Valeur', required: true },
        { name: 'label', type: 'text', label: 'Légende' },
      ],
    },
    linkGroup({
      appearances: ['default', 'outline'],
      overrides: {
        maxRows: 3,
      },
    }),
  ],
  labels: {
    plural: 'Calls to Action',
    singular: 'Call to Action',
  },
}
