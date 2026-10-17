import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-vercel-postgres'

import { contactFormData } from '../endpoints/seed/contactForm'

// Emails each contact form message to Léo, as they were only saved in Form Submissions. A contact
// form that already sends an email is left as is. Sites that were not seeded yet get it from the
// starter pages button instead.
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // Checking for forms with SQL rather than Payload keeps this migration working on a new site
  // after later schema changes
  const { rows } = await db.execute(sql`select 1 from forms limit 1`)
  if (rows.length === 0) return

  const {
    docs: [contactForm],
  } = await payload.find({
    collection: 'forms',
    depth: 0,
    limit: 1,
    req,
    where: { title: { equals: contactFormData.title } },
  })
  if (!contactForm || contactForm.emails?.length) return

  await payload.update({
    collection: 'forms',
    id: contactForm.id,
    data: { emails: contactFormData.emails },
    depth: 0,
    req,
  })
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // Content change only
}
