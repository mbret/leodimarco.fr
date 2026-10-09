# leodimarco.fr

Website of Léo Di Marco, tattoo artist. Built with [Payload CMS](https://payloadcms.com) and Next.js, hosted on Vercel, with a Neon Postgres database and Cloudflare R2 for uploads. The UI uses [shadcn/ui](https://ui.shadcn.com) with a single dark theme.

## Content

Everything is edited from the admin panel at `/admin`, which is in French.

- **Pages**: each page is a hero plus a list of blocks. The site has Accueil (`home`), Prestations, Galerie, À propos, FAQ and Contact, plus a page per service (Effet rasé, Densification capillaire, Camouflage de cicatrices) that the Prestations cards lead to. A Low Impact hero can show « Motif de points »: a patch of dots beside the title, different on every visit, that keeps clear of the text and appears dot by dot as the page loads. Every page has it on, and the end of each page mirrors it with a patch at the bottom left, which appears when visitors reach it.
- **Réalisations**: the tattoo photos. Drag and drop in the list to change their order. The Gallery block shows them (all of them, or the first few on the homepage).
- **Blocks** available on pages:
  - Content: rich text in columns, with lists and tables. Quotes are set in large type, check lists show a check mark for each ticked item, and a column ticked "Encadré" is shown in a box
  - Repères: short facts shown as cards, each a value such as « 29 ans » with a caption
  - Call to Action
  - Media
  - Gallery: shows the Réalisations
  - Prestations: service cards with an optional price and button
  - FAQ: questions and answers in categories, each category optionally ending with a button. Questions ticked "Mettre en avant" also appear as cards at the top with their short answer. The questions are exposed to search engines as structured data
  - Form: a form built in the Forms collection
- **Header / Footer**: the menu links.
- **Coordonnées du studio**: phone, address and social links. They are shown in the footer and published to search engines as local business data.
- **Forms / Form Submissions**: the contact form and the messages it receives.
- **Redirects**: redirect old URLs to new pages.

On an empty site, the dashboard offers a button that creates the starter pages, menus and contact form with placeholder text. It only creates what is missing and never overwrites existing content.

## Deploying to Vercel

The Vercel build command is `pnpm run ci`, so database migrations run on every deploy.

Services:

- **Neon Postgres**: connected through the Vercel integration, which sets `POSTGRES_URL`.
- **Preview database**: preview deployments use `PREVIEW_POSTGRES_URL` (Preview only), which points to a Neon branch named `preview`. Pull request migrations therefore run on that branch, never on production. To refresh it with production data, reset the branch from its parent in the Neon console.
- **Cloudflare R2**: create a bucket and an R2 API token with Object Read & Write access to it, then add these environment variables to the Vercel project (Production and Preview):
  - `R2_ENDPOINT`: the bucket's S3 endpoint, `https://<account_id>.r2.cloudflarestorage.com` (or `https://<account_id>.eu.r2.cloudflarestorage.com` for an EU bucket)
  - `R2_BUCKET`: the bucket name
  - `R2_ACCESS_KEY_ID` and `R2_SECRET_ACCESS_KEY`: from the R2 API token

  Without `R2_BUCKET`, uploads are written to `public/media`, which fails on Vercel's read-only filesystem.

Secrets, which should be long random strings:

- `PAYLOAD_SECRET`: signs Payload's JWT tokens
- `PREVIEW_SECRET`: secures draft previews
- `CRON_SECRET`: authorizes Vercel cron calls to the jobs endpoint (scheduled publishing)

The public URL comes from `NEXT_PUBLIC_SERVER_URL` in `.env.production`.

## Local development

1. `cp .env.example .env` and set `POSTGRES_URL`. A local database is recommended. If the connection string contains `localhost` or `127.0.0.1`, a regular Postgres adapter is used instead of the Vercel one. Alternatively, `docker-compose up` starts one on port 54320 (set `POSTGRES_DB` in `docker-compose.yml` to the database name in `.env`). Add the `R2_*` variables only if you want uploads stored in R2; without them uploads go to `public/media`.
2. `pnpm install && pnpm dev`, then open `http://localhost:3000/admin` to create the first admin user.

### Schema changes

In development, Payload pushes schema changes to the local database automatically. Never point development at the production database. For every schema change, create a migration and commit it:

```bash
pnpm payload migrate:create
```

Deploys run pending migrations with `pnpm payload migrate`.
