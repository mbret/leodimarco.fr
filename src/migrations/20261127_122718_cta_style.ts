import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_cta_style" AS ENUM('card', 'band');
  CREATE TYPE "public"."enum__pages_v_blocks_cta_style" AS ENUM('card', 'band');
  ALTER TABLE "pages_blocks_cta" ADD COLUMN "style" "enum_pages_blocks_cta_style" DEFAULT 'card';
  ALTER TABLE "_pages_v_blocks_cta" ADD COLUMN "style" "enum__pages_v_blocks_cta_style" DEFAULT 'card';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_cta" DROP COLUMN "style";
  ALTER TABLE "_pages_v_blocks_cta" DROP COLUMN "style";
  DROP TYPE "public"."enum_pages_blocks_cta_style";
  DROP TYPE "public"."enum__pages_v_blocks_cta_style";`)
}
