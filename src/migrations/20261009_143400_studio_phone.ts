import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-vercel-postgres'

// The studio phone, shown in the footer and given to search engines, becomes 07 44 42 94 88, the
// number of the WhatsApp button on the home page. Only the number written by the starter content
// is replaced, so a number changed in the admin stays. SQL rather than Payload keeps this
// migration working after later schema changes; new sites get the number from the starter content.
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    update "studio" set "phone" = '+33744429488', "updated_at" = now()
      where "phone" = '+33618510548';`)
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // Content change only. The number can be changed again in the admin.
}
