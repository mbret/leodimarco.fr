import { vercelPostgresAdapter } from '@payloadcms/db-vercel-postgres'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import sharp from 'sharp'
import path from 'path'
import { buildConfig, PayloadRequest } from 'payload'
import { fileURLToPath } from 'url'

import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Realisations } from './collections/Realisations'
import { Users } from './collections/Users'
import { Footer } from './Footer/config'
import { Header } from './Header/config'
import { Studio } from './Studio/config'
import { plugins } from './plugins'
import { defaultLexical } from '@/fields/defaultLexical'
import { getServerSideURL } from './utilities/getURL'
import { SITE_NAME } from './utilities/siteName'
import { s3Storage } from '@payloadcms/storage-s3'
import { en } from '@payloadcms/translations/languages/en'
import { fr } from '@payloadcms/translations/languages/fr'

// Preview deployments use a separate Neon branch so their migrations never touch production
const getDatabaseURL = () => {
  if (process.env.VERCEL_ENV !== 'preview') return process.env.POSTGRES_URL || ''

  if (!process.env.PREVIEW_POSTGRES_URL) {
    throw new Error('PREVIEW_POSTGRES_URL must be set for preview deployments')
  }
  return process.env.PREVIEW_POSTGRES_URL
}

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    components: {
      // Offers to create the starter pages on an empty site
      beforeDashboard: ['@/components/BeforeDashboard'],
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    user: Users.slug,
    livePreview: {
      breakpoints: [
        {
          label: 'Mobile',
          name: 'mobile',
          width: 375,
          height: 667,
        },
        {
          label: 'Tablet',
          name: 'tablet',
          width: 768,
          height: 1024,
        },
        {
          label: 'Desktop',
          name: 'desktop',
          width: 1440,
          height: 900,
        },
      ],
    },
  },
  // This config helps us configure global or default features that the other editors can inherit
  editor: defaultLexical,
  db: vercelPostgresAdapter({
    pool: {
      connectionString: getDatabaseURL(),
    },
  }),
  // Sends the contact form's emails from the site's own Gmail account, with an app password. Without
  // one (local development), Payload only writes emails to the console.
  email:
    process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD
      ? nodemailerAdapter({
          defaultFromAddress: process.env.GMAIL_USER,
          defaultFromName: `Site ${SITE_NAME}`,
          // Connects when sending only, rather than on every cold start
          skipVerify: true,
          transportOptions: {
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
          },
        })
      : undefined,
  collections: [Pages, Realisations, Media, Users],
  cors: [getServerSideURL()].filter(Boolean),
  plugins: [
    ...plugins,
    // Cloudflare R2 through its S3 API; without R2_BUCKET (local dev) uploads go to public/media
    s3Storage({
      alwaysInsertFields: true,
      enabled: Boolean(process.env.R2_BUCKET),
      collections: {
        media: true,
      },
      bucket: process.env.R2_BUCKET || '',
      config: {
        endpoint: process.env.R2_ENDPOINT,
        region: 'auto',
        credentials: {
          accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
        },
      },
    }),
  ],
  globals: [Header, Footer, Studio],
  i18n: {
    fallbackLanguage: 'fr',
    supportedLanguages: { fr, en },
  },
  secret: process.env.PAYLOAD_SECRET,
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  jobs: {
    access: {
      run: ({ req }: { req: PayloadRequest }): boolean => {
        // Allow logged in users to execute this endpoint (default)
        if (req.user) return true

        const secret = process.env.CRON_SECRET
        if (!secret) return false

        // If there is no logged in user, then check
        // for the Vercel Cron secret to be present as an
        // Authorization header:
        const authHeader = req.headers.get('authorization')
        return authHeader === `Bearer ${secret}`
      },
    },
    tasks: [],
  },
})
