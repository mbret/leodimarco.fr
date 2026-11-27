import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_services_layout" AS ENUM('cards', 'drawings');
  CREATE TYPE "public"."enum__pages_v_blocks_services_layout" AS ENUM('cards', 'drawings');
  ALTER TABLE "pages_blocks_services" ADD COLUMN "layout" "enum_pages_blocks_services_layout" DEFAULT 'cards';
  ALTER TABLE "_pages_v_blocks_services" ADD COLUMN "layout" "enum__pages_v_blocks_services_layout" DEFAULT 'cards';
  ALTER TABLE "pages_blocks_testimonials_reviews" DROP COLUMN "excerpt";
  ALTER TABLE "_pages_v_blocks_testimonials_reviews" DROP COLUMN "excerpt";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_testimonials_reviews" ADD COLUMN "excerpt" varchar;
  ALTER TABLE "_pages_v_blocks_testimonials_reviews" ADD COLUMN "excerpt" varchar;
  ALTER TABLE "pages_blocks_services" DROP COLUMN "layout";
  ALTER TABLE "_pages_v_blocks_services" DROP COLUMN "layout";
  DROP TYPE "public"."enum_pages_blocks_services_layout";
  DROP TYPE "public"."enum__pages_v_blocks_services_layout";`)
}
