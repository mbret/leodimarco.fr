import type { CollectionConfig } from 'payload'

import type { Page } from '@/payload-types'

import { authenticated } from '../../access/authenticated'
import { authenticatedOrPublished } from '../../access/authenticatedOrPublished'
import { CallToAction } from '../../blocks/CallToAction/config'
import { Content } from '../../blocks/Content/config'
import { FAQ } from '../../blocks/FAQ/config'
import { FormBlock } from '../../blocks/Form/config'
import { Gallery } from '../../blocks/Gallery/config'
import { KeyFacts } from '../../blocks/KeyFacts/config'
import { MediaBlock } from '../../blocks/MediaBlock/config'
import { Services } from '../../blocks/Services/config'
import { Testimonials } from '../../blocks/Testimonials/config'
import { hero } from '@/heros/config'
import { createBreadcrumbsField, createParentField } from '@payloadcms/plugin-nested-docs'
import { slugField } from 'payload'
import { populatePublishedAt } from '../../hooks/populatePublishedAt'
import { generatePreviewPath } from '../../utilities/generatePreviewPath'
import { pagePath } from '../../utilities/pagePath'
import { revalidateDelete, revalidatePage } from './hooks/revalidatePage'

import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'

export const Pages: CollectionConfig<'pages'> = {
  slug: 'pages',
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  // This config controls what's populated by default when a page is referenced
  // https://payloadcms.com/docs/queries/select#defaultpopulate-collection-config-property
  // Type safe if the collection slug generic is passed to `CollectionConfig` - `CollectionConfig<'pages'>
  defaultPopulate: {
    title: true,
    slug: true,
    // Links need the full path of pages that sit under a parent
    breadcrumbs: true,
  },
  admin: {
    defaultColumns: ['title', 'slug', 'updatedAt'],
    livePreview: {
      url: ({ data, req }) =>
        generatePreviewPath({
          path: data?.slug ? pagePath(data) : null,
          collection: 'pages',
          req,
        }),
    },
    preview: (data, { req }) =>
      generatePreviewPath({
        path: data?.slug
          ? pagePath({
              slug: data.slug as string,
              breadcrumbs: data.breadcrumbs as Page['breadcrumbs'],
            })
          : null,
        collection: 'pages',
        req,
      }),
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      type: 'tabs',
      tabs: [
        {
          fields: [hero],
          label: 'Hero',
        },
        {
          fields: [
            {
              name: 'layout',
              type: 'blocks',
              blocks: [
                Content,
                CallToAction,
                MediaBlock,
                Gallery,
                Services,
                Testimonials,
                FAQ,
                FormBlock,
                KeyFacts,
              ],
              required: true,
              admin: {
                initCollapsed: true,
              },
            },
          ],
          label: 'Content',
        },
        {
          name: 'meta',
          label: 'SEO',
          fields: [
            OverviewField({
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
              imagePath: 'meta.image',
            }),
            MetaTitleField({
              hasGenerateFn: true,
            }),
            MetaImageField({
              relationTo: 'media',
            }),

            MetaDescriptionField({}),
            PreviewField({
              // if the `generateUrl` function is configured
              hasGenerateFn: true,

              // field paths to match the target field for data
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
            }),
          ],
        },
      ],
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
      },
    },
    slugField(),
    // A page with a parent sits under it: /prestations/effet-rase. The nested docs plugin keeps the
    // breadcrumbs, and so the page's path, up to date
    createParentField('pages', {
      label: 'Page parente',
      admin: {
        position: 'sidebar',
        description: 'La page s’affiche sous sa page parente, avec un fil d’Ariane.',
      },
    }),
    createBreadcrumbsField('pages', {
      label: 'Fil d’Ariane',
      admin: {
        hidden: true,
      },
    }),
  ],
  hooks: {
    afterChange: [revalidatePage],
    beforeChange: [populatePublishedAt],
    afterDelete: [revalidateDelete],
  },
  versions: {
    drafts: {
      autosave: {
        interval: 100, // We set this interval for optimal live preview
      },
      schedulePublish: true,
    },
    maxPerDoc: 50,
  },
}
