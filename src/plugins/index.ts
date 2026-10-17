import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import type { BeforeEmail } from '@payloadcms/plugin-form-builder/types'
import { nestedDocsPlugin } from '@payloadcms/plugin-nested-docs'
import { redirectsPlugin } from '@payloadcms/plugin-redirects'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { Plugin, type TextFieldSingleValidation } from 'payload'
import { revalidateRedirects } from '@/hooks/revalidateRedirects'
import { GenerateTitle, GenerateURL } from '@payloadcms/plugin-seo/types'
import { FixedToolbarFeature, HeadingFeature, lexicalEditor } from '@payloadcms/richtext-lexical'

import { Page } from '@/payload-types'
import { getServerSideURL } from '@/utilities/getURL'
import { pagePath } from '@/utilities/pagePath'
import { DEFAULT_SENDER, SENDING_DOMAIN } from '@/utilities/sender'

// generateMeta appends the site name, so the SEO title is just the document title
const generateTitle: GenerateTitle<Page> = ({ doc }) => {
  return doc?.title || ''
}

const generateURL: GenerateURL<Page> = ({ doc }) => {
  const url = getServerSideURL()

  return doc?.slug && doc.slug !== 'home' ? `${url}${pagePath(doc)}` : url
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

// Anyone can post to the form submissions endpoint, so a bot could otherwise flood the recipient's
// mailbox and spend the SES quota. Past this many messages in the last hour, they are still saved
// in Form Submissions, just not emailed.
const HOURLY_EMAIL_CAP = 50

const beforeEmail: BeforeEmail = async (emails, { req }) => {
  // Counts this message too, which is saved in the same transaction
  const { totalDocs: lastHour } = await req.payload.count({
    collection: 'form-submissions',
    req,
    where: { createdAt: { greater_than: new Date(Date.now() - 3_600_000).toISOString() } },
  })
  if (lastHour > HOURLY_EMAIL_CAP) {
    req.payload.logger.warn(`${lastHour} form submissions in the last hour, not emailing them`)
    return []
  }

  // HTML also ignores the line breaks typed in the message. Answers never contain a raw "<", so
  // line breaks outside of tags all come from them.
  return emails.map((email) => ({
    ...email,
    html: email.html.replace(/(<[^>]*>)|\r?\n/g, (_, tag?: string) => tag ?? '<br>'),
    replyTo: unescapeHTML(email.replyTo),
    subject: unescapeHTML(email.subject),
  }))
}

// SES drops emails from any other domain, so the admin would never notice a typo here
const validateSender: TextFieldSingleValidation = (value) =>
  !value ||
  value
    .trim()
    .replace(/^.*<(.+)>$/, '$1')
    .toLowerCase()
    .endsWith(`@${SENDING_DOMAIN}`) ||
  `L’adresse doit se terminer par @${SENDING_DOMAIN}.`

export const plugins: Plugin[] = [
  // Pages can sit under a parent page. The parent and breadcrumbs fields are declared on Pages
  nestedDocsPlugin({
    collections: ['pages'],
    generateURL: (docs) => docs.reduce((url, doc) => `${url}/${doc.slug}`, ''),
  }),
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
          if (field.type === 'array' && field.name === 'emails') {
            return {
              ...field,
              fields: field.fields.map((emailField) =>
                emailField.type === 'row'
                  ? {
                      ...emailField,
                      fields: emailField.fields.map((rowField) =>
                        rowField.type === 'text' &&
                        !rowField.hasMany &&
                        rowField.name === 'emailFrom'
                          ? {
                              ...rowField,
                              admin: {
                                ...rowField.admin,
                                description: `Laissez vide pour envoyer depuis ${DEFAULT_SENDER}. L’adresse doit être sur ${SENDING_DOMAIN}, le domaine vérifié dans Amazon SES.`,
                              },
                              validate: validateSender,
                            }
                          : rowField,
                      ),
                    }
                  : emailField,
              ),
            }
          }
          return field
        })
      },
    },
  }),
]
