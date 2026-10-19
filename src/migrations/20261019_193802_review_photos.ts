import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_testimonials_reviews" ADD COLUMN "photo_id" integer;
  ALTER TABLE "_pages_v_blocks_testimonials_reviews" ADD COLUMN "photo_id" integer;
  ALTER TABLE "pages_blocks_testimonials_reviews" ADD CONSTRAINT "pages_blocks_testimonials_reviews_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_testimonials_reviews" ADD CONSTRAINT "_pages_v_blocks_testimonials_reviews_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "pages_blocks_testimonials_reviews_photo_idx" ON "pages_blocks_testimonials_reviews" USING btree ("photo_id");
  CREATE INDEX "_pages_v_blocks_testimonials_reviews_photo_idx" ON "_pages_v_blocks_testimonials_reviews" USING btree ("photo_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_testimonials_reviews" DROP CONSTRAINT "pages_blocks_testimonials_reviews_photo_id_media_id_fk";
  
  ALTER TABLE "_pages_v_blocks_testimonials_reviews" DROP CONSTRAINT "_pages_v_blocks_testimonials_reviews_photo_id_media_id_fk";
  
  DROP INDEX "pages_blocks_testimonials_reviews_photo_idx";
  DROP INDEX "_pages_v_blocks_testimonials_reviews_photo_idx";
  ALTER TABLE "pages_blocks_testimonials_reviews" DROP COLUMN "photo_id";
  ALTER TABLE "_pages_v_blocks_testimonials_reviews" DROP COLUMN "photo_id";`)
}
