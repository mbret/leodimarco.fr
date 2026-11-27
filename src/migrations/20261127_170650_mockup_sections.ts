import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_gallery_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_pages_blocks_gallery_layout" AS ENUM('cards', 'row');
  CREATE TYPE "public"."enum_pages_blocks_testimonials_layout" AS ENUM('cards', 'featured');
  CREATE TYPE "public"."enum__pages_v_blocks_gallery_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__pages_v_blocks_gallery_layout" AS ENUM('cards', 'row');
  CREATE TYPE "public"."enum__pages_v_blocks_testimonials_layout" AS ENUM('cards', 'featured');
  CREATE TYPE "public"."enum_header_button_type" AS ENUM('reference', 'custom');
  ALTER TYPE "public"."enum_pages_hero_type" ADD VALUE 'photo';
  ALTER TYPE "public"."enum__pages_v_version_hero_type" ADD VALUE 'photo';
  CREATE TABLE "pages_hero_highlights" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "pages_blocks_cta_facts" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar
  );
  
  CREATE TABLE "pages_blocks_steps_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"title" varchar,
  	"text" varchar
  );
  
  CREATE TABLE "pages_blocks_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_version_hero_highlights" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_cta_facts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_steps_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"title" varchar,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "pages_blocks_gallery" ADD COLUMN "enable_link" boolean;
  ALTER TABLE "pages_blocks_gallery" ADD COLUMN "link_type" "enum_pages_blocks_gallery_link_type" DEFAULT 'reference';
  ALTER TABLE "pages_blocks_gallery" ADD COLUMN "link_new_tab" boolean;
  ALTER TABLE "pages_blocks_gallery" ADD COLUMN "link_url" varchar;
  ALTER TABLE "pages_blocks_gallery" ADD COLUMN "link_label" varchar;
  ALTER TABLE "pages_blocks_gallery" ADD COLUMN "layout" "enum_pages_blocks_gallery_layout" DEFAULT 'cards';
  ALTER TABLE "pages_blocks_testimonials_reviews" ADD COLUMN "excerpt" varchar;
  ALTER TABLE "pages_blocks_testimonials" ADD COLUMN "layout" "enum_pages_blocks_testimonials_layout" DEFAULT 'cards';
  ALTER TABLE "_pages_v_blocks_gallery" ADD COLUMN "enable_link" boolean;
  ALTER TABLE "_pages_v_blocks_gallery" ADD COLUMN "link_type" "enum__pages_v_blocks_gallery_link_type" DEFAULT 'reference';
  ALTER TABLE "_pages_v_blocks_gallery" ADD COLUMN "link_new_tab" boolean;
  ALTER TABLE "_pages_v_blocks_gallery" ADD COLUMN "link_url" varchar;
  ALTER TABLE "_pages_v_blocks_gallery" ADD COLUMN "link_label" varchar;
  ALTER TABLE "_pages_v_blocks_gallery" ADD COLUMN "layout" "enum__pages_v_blocks_gallery_layout" DEFAULT 'cards';
  ALTER TABLE "_pages_v_blocks_testimonials_reviews" ADD COLUMN "excerpt" varchar;
  ALTER TABLE "_pages_v_blocks_testimonials" ADD COLUMN "layout" "enum__pages_v_blocks_testimonials_layout" DEFAULT 'cards';
  ALTER TABLE "header" ADD COLUMN "enable_button" boolean;
  ALTER TABLE "header" ADD COLUMN "button_type" "enum_header_button_type" DEFAULT 'reference';
  ALTER TABLE "header" ADD COLUMN "button_new_tab" boolean;
  ALTER TABLE "header" ADD COLUMN "button_url" varchar;
  ALTER TABLE "header" ADD COLUMN "button_label" varchar;
  ALTER TABLE "pages_hero_highlights" ADD CONSTRAINT "pages_hero_highlights_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_cta_facts" ADD CONSTRAINT "pages_blocks_cta_facts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_cta"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_steps_items" ADD CONSTRAINT "pages_blocks_steps_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_steps" ADD CONSTRAINT "pages_blocks_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_version_hero_highlights" ADD CONSTRAINT "_pages_v_version_hero_highlights_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_cta_facts" ADD CONSTRAINT "_pages_v_blocks_cta_facts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_cta"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_steps_items" ADD CONSTRAINT "_pages_v_blocks_steps_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_steps" ADD CONSTRAINT "_pages_v_blocks_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_hero_highlights_order_idx" ON "pages_hero_highlights" USING btree ("_order");
  CREATE INDEX "pages_hero_highlights_parent_id_idx" ON "pages_hero_highlights" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_cta_facts_order_idx" ON "pages_blocks_cta_facts" USING btree ("_order");
  CREATE INDEX "pages_blocks_cta_facts_parent_id_idx" ON "pages_blocks_cta_facts" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_steps_items_order_idx" ON "pages_blocks_steps_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_steps_items_parent_id_idx" ON "pages_blocks_steps_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_steps_order_idx" ON "pages_blocks_steps" USING btree ("_order");
  CREATE INDEX "pages_blocks_steps_parent_id_idx" ON "pages_blocks_steps" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_steps_path_idx" ON "pages_blocks_steps" USING btree ("_path");
  CREATE INDEX "_pages_v_version_hero_highlights_order_idx" ON "_pages_v_version_hero_highlights" USING btree ("_order");
  CREATE INDEX "_pages_v_version_hero_highlights_parent_id_idx" ON "_pages_v_version_hero_highlights" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_cta_facts_order_idx" ON "_pages_v_blocks_cta_facts" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_cta_facts_parent_id_idx" ON "_pages_v_blocks_cta_facts" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_steps_items_order_idx" ON "_pages_v_blocks_steps_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_steps_items_parent_id_idx" ON "_pages_v_blocks_steps_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_steps_order_idx" ON "_pages_v_blocks_steps" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_steps_parent_id_idx" ON "_pages_v_blocks_steps" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_steps_path_idx" ON "_pages_v_blocks_steps" USING btree ("_path");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  // Pages with the photo hero go back to Low Impact first, so that the hero type can be removed
  await db.execute(sql`
  UPDATE "pages" SET "hero_type" = 'lowImpact' WHERE "hero_type" = 'photo';
  UPDATE "_pages_v" SET "version_hero_type" = 'lowImpact' WHERE "version_hero_type" = 'photo';
   DROP TABLE "pages_hero_highlights" CASCADE;
  DROP TABLE "pages_blocks_cta_facts" CASCADE;
  DROP TABLE "pages_blocks_steps_items" CASCADE;
  DROP TABLE "pages_blocks_steps" CASCADE;
  DROP TABLE "_pages_v_version_hero_highlights" CASCADE;
  DROP TABLE "_pages_v_blocks_cta_facts" CASCADE;
  DROP TABLE "_pages_v_blocks_steps_items" CASCADE;
  DROP TABLE "_pages_v_blocks_steps" CASCADE;
  ALTER TABLE "pages" ALTER COLUMN "hero_type" SET DATA TYPE text;
  ALTER TABLE "pages" ALTER COLUMN "hero_type" SET DEFAULT 'lowImpact'::text;
  DROP TYPE "public"."enum_pages_hero_type";
  CREATE TYPE "public"."enum_pages_hero_type" AS ENUM('none', 'highImpact', 'mediumImpact', 'lowImpact');
  ALTER TABLE "pages" ALTER COLUMN "hero_type" SET DEFAULT 'lowImpact'::"public"."enum_pages_hero_type";
  ALTER TABLE "pages" ALTER COLUMN "hero_type" SET DATA TYPE "public"."enum_pages_hero_type" USING "hero_type"::"public"."enum_pages_hero_type";
  ALTER TABLE "_pages_v" ALTER COLUMN "version_hero_type" SET DATA TYPE text;
  ALTER TABLE "_pages_v" ALTER COLUMN "version_hero_type" SET DEFAULT 'lowImpact'::text;
  DROP TYPE "public"."enum__pages_v_version_hero_type";
  CREATE TYPE "public"."enum__pages_v_version_hero_type" AS ENUM('none', 'highImpact', 'mediumImpact', 'lowImpact');
  ALTER TABLE "_pages_v" ALTER COLUMN "version_hero_type" SET DEFAULT 'lowImpact'::"public"."enum__pages_v_version_hero_type";
  ALTER TABLE "_pages_v" ALTER COLUMN "version_hero_type" SET DATA TYPE "public"."enum__pages_v_version_hero_type" USING "version_hero_type"::"public"."enum__pages_v_version_hero_type";
  ALTER TABLE "pages_blocks_gallery" DROP COLUMN "enable_link";
  ALTER TABLE "pages_blocks_gallery" DROP COLUMN "link_type";
  ALTER TABLE "pages_blocks_gallery" DROP COLUMN "link_new_tab";
  ALTER TABLE "pages_blocks_gallery" DROP COLUMN "link_url";
  ALTER TABLE "pages_blocks_gallery" DROP COLUMN "link_label";
  ALTER TABLE "pages_blocks_gallery" DROP COLUMN "layout";
  ALTER TABLE "pages_blocks_testimonials_reviews" DROP COLUMN "excerpt";
  ALTER TABLE "pages_blocks_testimonials" DROP COLUMN "layout";
  ALTER TABLE "_pages_v_blocks_gallery" DROP COLUMN "enable_link";
  ALTER TABLE "_pages_v_blocks_gallery" DROP COLUMN "link_type";
  ALTER TABLE "_pages_v_blocks_gallery" DROP COLUMN "link_new_tab";
  ALTER TABLE "_pages_v_blocks_gallery" DROP COLUMN "link_url";
  ALTER TABLE "_pages_v_blocks_gallery" DROP COLUMN "link_label";
  ALTER TABLE "_pages_v_blocks_gallery" DROP COLUMN "layout";
  ALTER TABLE "_pages_v_blocks_testimonials_reviews" DROP COLUMN "excerpt";
  ALTER TABLE "_pages_v_blocks_testimonials" DROP COLUMN "layout";
  ALTER TABLE "header" DROP COLUMN "enable_button";
  ALTER TABLE "header" DROP COLUMN "button_type";
  ALTER TABLE "header" DROP COLUMN "button_new_tab";
  ALTER TABLE "header" DROP COLUMN "button_url";
  ALTER TABLE "header" DROP COLUMN "button_label";
  DROP TYPE "public"."enum_pages_blocks_gallery_link_type";
  DROP TYPE "public"."enum_pages_blocks_gallery_layout";
  DROP TYPE "public"."enum_pages_blocks_testimonials_layout";
  DROP TYPE "public"."enum__pages_v_blocks_gallery_link_type";
  DROP TYPE "public"."enum__pages_v_blocks_gallery_layout";
  DROP TYPE "public"."enum__pages_v_blocks_testimonials_layout";
  DROP TYPE "public"."enum_header_button_type";`)
}
