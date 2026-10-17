import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-vercel-postgres'

// Turns on the dot pattern beside the title of every page with a Low Impact header, in the page
// and in its latest version, which the admin edits. SQL rather than Payload: saving a page through
// Payload validates all of it, and would fail on content that no longer validates (a link to a
// deleted page, for example) although only this option changes. New sites get the dots from the
// starter pages button.
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    update "pages" set "hero_dot_pattern" = true where "hero_type" = 'lowImpact';
    update "_pages_v" set "version_hero_dot_pattern" = true
      where "latest" and "version_hero_type" = 'lowImpact';`)
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // Content change only. Each page's option can be turned off again in the admin.
}
