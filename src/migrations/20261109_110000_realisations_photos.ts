import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-vercel-postgres'

// Empty on purpose: 20261113_145332_realisation_views adds Léo's healed results with all their
// views, and completes the ones that sites which already ran this migration have.
export async function up(_args: MigrateUpArgs): Promise<void> {}

export async function down(_args: MigrateDownArgs): Promise<void> {}
