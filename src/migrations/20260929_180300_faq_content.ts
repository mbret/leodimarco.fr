import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-vercel-postgres'

// Used to fill the FAQ page with the categorised content from Léo's mockup. The FAQ content now
// comes from 20261004_134300_faq_final_content, which runs after the schema it needs, so there is
// nothing left to do here.
export async function up(_args: MigrateUpArgs): Promise<void> {}

export async function down(_args: MigrateDownArgs): Promise<void> {}
