import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import type { BeforeEmail } from '@payloadcms/plugin-form-builder/types'
import { redirectsPlugin } from '@payloadcms/plugin-redirects'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { Plugin } from 'payload'
import { revalidateRedirects } from '@/hooks/revalidateRedirects'
import { GenerateTitle, GenerateURL } from '@payloadcms/plugin-seo/types'
import { FixedToolbarFeature, HeadingFeature, lexicalEditor } from '@payloadcms/richtext-lexical'

import { Page } from '@/payload-types'
import { getServerSideURL } from '@/utilities/getURL'

// generateMeta appends the site name, so the SEO title is just the document title
const generateTitle: GenerateTitle<Page> = ({ doc }) => {
  return doc?.title || ''
}

const generateURL: GenerateURL<Page> = ({ doc }) => {
  const url = getServerSideURL()

  return doc?.slug && doc.slug !== 'home' ? `${url}/${doc.slug}` : url
}

const escapedCharacters: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
}

// The form builder escapes the visitor's answers for HTML, but the subject and reply-to address
// are plain text
const unescapeHTML = (text: string) =>
  text && text.replace(/&(amp|lt|gt|quot|#39);/g, (entity) => escapedCharacters[entity])

// HTML also ignores the line breaks typed in the message. Answers never contain a raw "<", so line
// breaks outside of tags all come from them.
const beforeEmail: BeforeEmail = (emails) =>
  emails.map((email) => ({
    ...email,
    html: email.html.replace(/(<[^>]*>)|\r?\n/g, (_, tag?: string) => tag ?? '<br>'),
    replyTo: unescapeHTML(email.replyTo),
    subject: unescapeHTML(email.subject),
  }))

export const plugins: Plugin[] = [
  redirectsPlugin({
    collections: ['pages'],
    overrides: {
      // @ts-expect-error - This is a valid override, mapped fields don't resolve to the same type
      fields: ({ defaultFields }) => {
        return defaultFields.map((field) => {
          if ('name' in field && field.name === 'from') {
            return {
              ...field,
              admin: {
                description: 'You will need to rebuild the website when changing this field.',
              },
            }
          }
          return field
        })
      },
      hooks: {
        afterChange: [revalidateRedirects],
      },
    },
  }),
  seoPlugin({
    generateTitle,
    generateURL,
  }),
  formBuilderPlugin({
    beforeEmail,
    fields: {
      payment: false,
    },
    formOverrides: {
      fields: ({ defaultFields }) => {
        return defaultFields.map((field) => {
          if ('name' in field && field.name === 'confirmationMessage') {
            return {
              ...field,
              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [
                    ...rootFeatures,
                    FixedToolbarFeature(),
                    HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
                  ]
                },
              }),
            }
          }
          return field
        })
      },
    },
  }),
]
