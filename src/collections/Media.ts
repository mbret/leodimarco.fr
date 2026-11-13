import type { CollectionConfig } from 'payload'

import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import path from 'path'
import { fileURLToPath } from 'url'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export const Media: CollectionConfig = {
  slug: 'media',
  folders: true,
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      label: 'Texte alternatif',
      admin: {
        description:
          'Décrit l’image pour Google et les lecteurs d’écran, par exemple « Tricopigmentation effet crâne rasé, vue de profil ».',
      },
      // Checked on save instead of `required`, which would make the column NOT NULL and fail the
      // migration for images already saved without one
      validate: (value: string | null | undefined) =>
        Boolean(value?.trim()) || 'Décrivez l’image en quelques mots.',
    },
    {
      name: 'caption',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [...rootFeatures, FixedToolbarFeature(), InlineToolbarFeature()]
        },
      }),
    },
  ],
  upload: {
    // Upload to the public/media directory in Next.js making them publicly accessible even outside of Payload
    staticDir: path.resolve(dirname, '../../public/media'),
    adminThumbnail: 'thumbnail',
    /**
     * For a bare `/api/media/file/<filename>` URL: one day fresh, then a month in which a cache
     * answers from its copy and refreshes in the background. The media file route gives URLs
     * with a cache tag a year instead (see `mediaCacheTag.ts`). Without this header, Vercel
     * answers `max-age=0, must-revalidate` and caches nothing.
     */
    modifyResponseHeaders: ({ headers }) => {
      headers.set(
        'Cache-Control',
        'public, max-age=86400, s-maxage=86400, stale-while-revalidate=2592000',
      )

      return headers
    },
    focalPoint: true,
    /**
     * `thumbnail` to `xlarge` are the widths `ImageMedia` offers in its `srcset`. Sharp makes them
     * once, at upload, in WebP. This replaces Vercel's image optimizer, which bills each width,
     * quality and format again on request. Payload skips a size wider than the upload, so a small
     * upload gets only the lower widths.
     */
    imageSizes: [
      {
        name: 'thumbnail',
        width: 300,
        formatOptions: { format: 'webp', options: { quality: 75 } },
      },
      {
        name: 'square',
        width: 500,
        height: 500,
      },
      {
        name: 'small',
        width: 600,
        formatOptions: { format: 'webp', options: { quality: 75 } },
      },
      {
        name: 'medium',
        width: 900,
        formatOptions: { format: 'webp', options: { quality: 75 } },
      },
      {
        name: 'large',
        width: 1400,
        formatOptions: { format: 'webp', options: { quality: 75 } },
      },
      // `withoutEnlargement` makes this size at the upload's own width when the upload is
      // narrower than 1920, instead of skipping it. So every upload has a WebP copy at full width.
      {
        name: 'xlarge',
        width: 1920,
        withoutEnlargement: true,
        formatOptions: { format: 'webp', options: { quality: 75 } },
      },
      // Kept in the upload's format: social sites read this one, and some may not read WebP
      {
        name: 'og',
        width: 1200,
        height: 630,
        crop: 'center',
      },
    ],
  },
}
