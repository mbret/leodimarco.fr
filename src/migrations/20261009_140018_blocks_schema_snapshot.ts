import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-vercel-postgres'

// The testimonials block was added in parallel with other schema changes (the key facts block, the
// hero dot pattern, service buttons and nested pages), so their snapshots, the latest ones, do not
// include the testimonials tables. This migration only carries a snapshot of the whole schema,
// which the next generated migration is compared against. 20261009_111606_testimonials_block
// creates the tables, so there is nothing to run here.
export async function up(_args: MigrateUpArgs): Promise<void> {}

export async function down(_args: MigrateDownArgs): Promise<void> {}
