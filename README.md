# leodimarco.fr

Website of Léo Di Marco, tattoo artist. Built with [Payload CMS](https://payloadcms.com) and Next.js, hosted on Vercel, with a Neon Postgres database and Cloudflare R2 for uploads. The UI uses [shadcn/ui](https://ui.shadcn.com) with a single light theme in the colours of Léo's studio: the white of its wall, the green band painted across it and black ink. Titles use Bricolage Grotesque and text uses Geist. A page or section title that ends with a full stop shows it in the green of the studio wall.

## Content

Everything is edited from the admin panel at `/admin`, which is in French.

- **Pages**: each page is a hero plus a list of blocks. The site has Accueil (`home`), Prestations, Galerie, À propos, FAQ and Contact, plus a page per service (Effet rasé, Densification capillaire, Camouflage de cicatrices) under Prestations, such as `/prestations/effet-rase`. A page given a « Page parente » sits under it in the URL and shows a breadcrumb above its title. A Low Impact hero can show « Motif de points »: a patch of dots beside the title, the same size on every page and different on every visit, that keeps clear of the text and appears dot by dot as the page loads. Every page with a Low Impact hero has it on, and the end of the page mirrors it with a patch at the bottom left, which appears when visitors reach it, unless the page ends on a green band that would cover it. The « Photo à côté du titre » hero, on the home page, puts a photo beside the text (under it on phones and tablets). Its title (H1) shows as a small label and its subtitle (H2) in large type, the words in bold darker than the rest, and short « Repères » sit on a line under the buttons. The « Bandeau vert avec photo » hero puts the title on a band in the green of the studio wall, with its photo beside it up to the edge of the screen (under the text on phones); À propos uses it once the migration has uploaded its photos. Its photo stays framed on the focal point set in Media.
- **Réalisations**: the healed results, one per client, each with a photo per view (Face, 3/4, Profil, Dos, Gros plan). Drag and drop in the list to change their order, and in a réalisation to change the order of its photos. The Gallery block shows them as cards, two per row from tablets (all of them, or the first few): the first photo, with a chip per view that shows the others in place, or a swipe on phones. A click or a tap on a photo, or its zoom button, opens the client's photos at full size: on the whole screen on phones, in a large panel on wider screens. There a pinch, the mouse wheel or a double tap zooms, a drag moves the photo, the chips change the view, and the close button, Escape or a click beside the panel closes it.
- **Blocks** available on pages:
  - Content: rich text in columns, with lists and tables. Quotes are set in large type, and check lists show a check mark for each ticked item. A column can also hold an image, under its text. A block of two or more columns that each hold only an image shows a row of photos, which visitors swipe on phones
  - Repères: short facts shown as cards, each a value such as « 29 ans » with a caption
  - Call to Action: text and buttons, with an optional round photo beside the text, such as Léo's portrait. Its « Bandeau vert » style puts it on a band in the green of the studio wall across the whole screen, with its photo large beside the text, up to the edge of the screen (under the text on phones), and optional « Repères » on a line under the text. A band without a photo shows dots on its right. A band that ends the page rests on the footer
  - Media
  - Gallery: shows the Réalisations, in large photos two per row or in small photos four per row, with an optional link beside its title
  - Étapes: numbered steps joined by a line of dots, each with an optional label such as « Au studio »
  - Prestations: service cards with an optional price and button, and an optional link beside the block title. A service given a « Dessin » (effet rasé, densité or cicatrice) shows as a tile instead: a drawing in dots, different on every visit, above its name, and its link covers the whole tile. On the scar drawing, the dots fill the scar when visitors point at the tile
  - Avis clients: client reviews with their star rating and the client's initial, or their photo when one is added, and an optional link. In the « Le premier avis en grand » layout, the first review shows in large type beside the others, and each review shows its « Extrait » when it has one such as "Voir tous les avis Google". The section appears as soon as it has a review or a link
  - FAQ: questions and answers in categories, each category optionally ending with a button. Questions ticked "Mettre en avant" also appear at the top with their short answer, on a band in the green of the studio wall. With two categories or more, a list of the categories appears. On large screens it stays beside the questions and marks the one being read. On phones and tablets it shows as chips above the questions. The questions are exposed to search engines as structured data
  - Form: a form built in the Forms collection
- **Header / Footer**: the menu links. The header can also show a button after the menu, such as « Envoyer mes photos » on WhatsApp, with only its icon on phones.
- **Coordonnées du studio**: phone, address and social links. They are shown in the footer and published to search engines as local business data.
- **Forms / Form Submissions**: the contact form and the messages it receives. Each message is also emailed to the recipient set in the form's Emails list, from the sender set there (on `leodimarco.fr`, `contact@leodimarco.fr` when empty); replying to that email answers the visitor. Past 50 messages in an hour, they are only saved.
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

  Images do not go through Next.js image optimization, which Vercel bills per transformation. At upload, Payload makes WebP copies at several widths, and `ImageMedia` offers them in a `srcset`. The route `src/app/(payload)/api/media/file/[filename]` reads each file straight from R2. Vercel's CDN keeps it until the next deploy, and browsers keep it for a year.

  Uploads made before the WebP sizes get them from the migration `20261121_120000_media_webp_sizes`, on the first deploy that runs it. It reads each original from R2, and keeps its filename and focal point.

- **Amazon SES** (`us-east-1`): sends the contact form's emails from an `@leodimarco.fr` address.
  1. Create a domain identity for `leodimarco.fr` with Easy DKIM, and add the three DKIM CNAME records it lists to the domain's DNS at OVH.
  2. While the account is in the SES sandbox, it can only send to verified addresses: also create an email address identity for the recipient set in the form, and confirm it from the email SES sends.
  3. Under SMTP settings, create SMTP credentials, then add these environment variables to the Vercel project (Production):
     - `SMTP_HOST`: `email-smtp.us-east-1.amazonaws.com`
     - `SMTP_USER` and `SMTP_PASS`: the SMTP credentials

  Without them, messages are still saved in Form Submissions, but no email is sent.

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
