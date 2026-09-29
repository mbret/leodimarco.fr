import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "realisations" ADD COLUMN "before_id" integer;
  ALTER TABLE "realisations" ADD CONSTRAINT "realisations_before_id_media_id_fk" FOREIGN KEY ("before_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "realisations_before_idx" ON "realisations" USING btree ("before_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "realisations" DROP CONSTRAINT "realisations_before_id_media_id_fk";
  
  DROP INDEX "realisations_before_idx";
  ALTER TABLE "realisations" DROP COLUMN "before_id";`)
}
