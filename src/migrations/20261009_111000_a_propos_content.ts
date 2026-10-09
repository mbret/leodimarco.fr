import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-vercel-postgres'

// Used to fill the À propos page with the content of Léo's À propos document. The page now comes
// from 20261009_113400_a_propos_layout, which runs after the schema it needs, so there is nothing
// left to do here.
export async function up(_args: MigrateUpArgs): Promise<void> {}

export async function down(_args: MigrateDownArgs): Promise<void> {}
