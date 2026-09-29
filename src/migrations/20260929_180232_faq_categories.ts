import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "pages_blocks_faq_categories_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" jsonb
  );
  
  CREATE TABLE "pages_blocks_faq_categories" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_faq_categories_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" jsonb,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_faq_categories" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"_uuid" varchar
  );
  
  DROP TABLE "pages_blocks_faq_items" CASCADE;
  DROP TABLE "_pages_v_blocks_faq_items" CASCADE;
  ALTER TABLE "pages_blocks_faq_categories_items" ADD CONSTRAINT "pages_blocks_faq_categories_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_faq_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_faq_categories" ADD CONSTRAINT "pages_blocks_faq_categories_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_faq_categories_items" ADD CONSTRAINT "_pages_v_blocks_faq_categories_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_faq_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_faq_categories" ADD CONSTRAINT "_pages_v_blocks_faq_categories_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_faq_categories_items_order_idx" ON "pages_blocks_faq_categories_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_faq_categories_items_parent_id_idx" ON "pages_blocks_faq_categories_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_faq_categories_order_idx" ON "pages_blocks_faq_categories" USING btree ("_order");
  CREATE INDEX "pages_blocks_faq_categories_parent_id_idx" ON "pages_blocks_faq_categories" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_faq_categories_items_order_idx" ON "_pages_v_blocks_faq_categories_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_faq_categories_items_parent_id_idx" ON "_pages_v_blocks_faq_categories_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_faq_categories_order_idx" ON "_pages_v_blocks_faq_categories" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_faq_categories_parent_id_idx" ON "_pages_v_blocks_faq_categories" USING btree ("_parent_id");
  ALTER TABLE "pages_blocks_faq" DROP COLUMN "heading";
  ALTER TABLE "_pages_v_blocks_faq" DROP COLUMN "heading";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "pages_blocks_faq_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_faq_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar,
  	"_uuid" varchar
  );
  
  DROP TABLE "pages_blocks_faq_categories_items" CASCADE;
  DROP TABLE "pages_blocks_faq_categories" CASCADE;
  DROP TABLE "_pages_v_blocks_faq_categories_items" CASCADE;
  DROP TABLE "_pages_v_blocks_faq_categories" CASCADE;
  ALTER TABLE "pages_blocks_faq" ADD COLUMN "heading" varchar;
  ALTER TABLE "_pages_v_blocks_faq" ADD COLUMN "heading" varchar;
  ALTER TABLE "pages_blocks_faq_items" ADD CONSTRAINT "pages_blocks_faq_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_faq_items" ADD CONSTRAINT "_pages_v_blocks_faq_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_faq_items_order_idx" ON "pages_blocks_faq_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_faq_items_parent_id_idx" ON "pages_blocks_faq_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_faq_items_order_idx" ON "_pages_v_blocks_faq_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_faq_items_parent_id_idx" ON "_pages_v_blocks_faq_items" USING btree ("_parent_id");`)
}
