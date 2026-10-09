import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_services_items_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_pages_blocks_services_items_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum__pages_v_blocks_services_items_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__pages_v_blocks_services_items_link_appearance" AS ENUM('default', 'outline');
  ALTER TABLE "pages_blocks_content_columns" ADD COLUMN "boxed" boolean;
  ALTER TABLE "pages_blocks_services_items" ADD COLUMN "enable_link" boolean;
  ALTER TABLE "pages_blocks_services_items" ADD COLUMN "link_type" "enum_pages_blocks_services_items_link_type" DEFAULT 'reference';
  ALTER TABLE "pages_blocks_services_items" ADD COLUMN "link_new_tab" boolean;
  ALTER TABLE "pages_blocks_services_items" ADD COLUMN "link_url" varchar;
  ALTER TABLE "pages_blocks_services_items" ADD COLUMN "link_label" varchar;
  ALTER TABLE "pages_blocks_services_items" ADD COLUMN "link_appearance" "enum_pages_blocks_services_items_link_appearance" DEFAULT 'default';
  ALTER TABLE "_pages_v_blocks_content_columns" ADD COLUMN "boxed" boolean;
  ALTER TABLE "_pages_v_blocks_services_items" ADD COLUMN "enable_link" boolean;
  ALTER TABLE "_pages_v_blocks_services_items" ADD COLUMN "link_type" "enum__pages_v_blocks_services_items_link_type" DEFAULT 'reference';
  ALTER TABLE "_pages_v_blocks_services_items" ADD COLUMN "link_new_tab" boolean;
  ALTER TABLE "_pages_v_blocks_services_items" ADD COLUMN "link_url" varchar;
  ALTER TABLE "_pages_v_blocks_services_items" ADD COLUMN "link_label" varchar;
  ALTER TABLE "_pages_v_blocks_services_items" ADD COLUMN "link_appearance" "enum__pages_v_blocks_services_items_link_appearance" DEFAULT 'default';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_content_columns" DROP COLUMN "boxed";
  ALTER TABLE "pages_blocks_services_items" DROP COLUMN "enable_link";
  ALTER TABLE "pages_blocks_services_items" DROP COLUMN "link_type";
  ALTER TABLE "pages_blocks_services_items" DROP COLUMN "link_new_tab";
  ALTER TABLE "pages_blocks_services_items" DROP COLUMN "link_url";
  ALTER TABLE "pages_blocks_services_items" DROP COLUMN "link_label";
  ALTER TABLE "pages_blocks_services_items" DROP COLUMN "link_appearance";
  ALTER TABLE "_pages_v_blocks_content_columns" DROP COLUMN "boxed";
  ALTER TABLE "_pages_v_blocks_services_items" DROP COLUMN "enable_link";
  ALTER TABLE "_pages_v_blocks_services_items" DROP COLUMN "link_type";
  ALTER TABLE "_pages_v_blocks_services_items" DROP COLUMN "link_new_tab";
  ALTER TABLE "_pages_v_blocks_services_items" DROP COLUMN "link_url";
  ALTER TABLE "_pages_v_blocks_services_items" DROP COLUMN "link_label";
  ALTER TABLE "_pages_v_blocks_services_items" DROP COLUMN "link_appearance";
  DROP TYPE "public"."enum_pages_blocks_services_items_link_type";
  DROP TYPE "public"."enum_pages_blocks_services_items_link_appearance";
  DROP TYPE "public"."enum__pages_v_blocks_services_items_link_type";
  DROP TYPE "public"."enum__pages_v_blocks_services_items_link_appearance";`)
}
