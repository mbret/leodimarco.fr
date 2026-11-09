import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_content_columns" ADD COLUMN "media_id" integer;
  ALTER TABLE "pages_blocks_cta" ADD COLUMN "media_id" integer;
  ALTER TABLE "_pages_v_blocks_content_columns" ADD COLUMN "media_id" integer;
  ALTER TABLE "_pages_v_blocks_cta" ADD COLUMN "media_id" integer;
  ALTER TABLE "pages_blocks_content_columns" ADD CONSTRAINT "pages_blocks_content_columns_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_cta" ADD CONSTRAINT "pages_blocks_cta_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_content_columns" ADD CONSTRAINT "_pages_v_blocks_content_columns_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_cta" ADD CONSTRAINT "_pages_v_blocks_cta_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "pages_blocks_content_columns_media_idx" ON "pages_blocks_content_columns" USING btree ("media_id");
  CREATE INDEX "pages_blocks_cta_media_idx" ON "pages_blocks_cta" USING btree ("media_id");
  CREATE INDEX "_pages_v_blocks_content_columns_media_idx" ON "_pages_v_blocks_content_columns" USING btree ("media_id");
  CREATE INDEX "_pages_v_blocks_cta_media_idx" ON "_pages_v_blocks_cta" USING btree ("media_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_content_columns" DROP CONSTRAINT "pages_blocks_content_columns_media_id_media_id_fk";
  
  ALTER TABLE "pages_blocks_cta" DROP CONSTRAINT "pages_blocks_cta_media_id_media_id_fk";
  
  ALTER TABLE "_pages_v_blocks_content_columns" DROP CONSTRAINT "_pages_v_blocks_content_columns_media_id_media_id_fk";
  
  ALTER TABLE "_pages_v_blocks_cta" DROP CONSTRAINT "_pages_v_blocks_cta_media_id_media_id_fk";
  
  DROP INDEX "pages_blocks_content_columns_media_idx";
  DROP INDEX "pages_blocks_cta_media_idx";
  DROP INDEX "_pages_v_blocks_content_columns_media_idx";
  DROP INDEX "_pages_v_blocks_cta_media_idx";
  ALTER TABLE "pages_blocks_content_columns" DROP COLUMN "media_id";
  ALTER TABLE "pages_blocks_cta" DROP COLUMN "media_id";
  ALTER TABLE "_pages_v_blocks_content_columns" DROP COLUMN "media_id";
  ALTER TABLE "_pages_v_blocks_cta" DROP COLUMN "media_id";`)
}
