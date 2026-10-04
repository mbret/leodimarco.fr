import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_faq_categories_items" ADD COLUMN "highlight" boolean;
  ALTER TABLE "pages_blocks_faq_categories_items" ADD COLUMN "short_answer" varchar;
  ALTER TABLE "pages_blocks_faq" ADD COLUMN "highlights_title" varchar DEFAULT 'Les questions les plus posées';
  ALTER TABLE "_pages_v_blocks_faq_categories_items" ADD COLUMN "highlight" boolean;
  ALTER TABLE "_pages_v_blocks_faq_categories_items" ADD COLUMN "short_answer" varchar;
  ALTER TABLE "_pages_v_blocks_faq" ADD COLUMN "highlights_title" varchar DEFAULT 'Les questions les plus posées';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_faq_categories_items" DROP COLUMN "highlight";
  ALTER TABLE "pages_blocks_faq_categories_items" DROP COLUMN "short_answer";
  ALTER TABLE "pages_blocks_faq" DROP COLUMN "highlights_title";
  ALTER TABLE "_pages_v_blocks_faq_categories_items" DROP COLUMN "highlight";
  ALTER TABLE "_pages_v_blocks_faq_categories_items" DROP COLUMN "short_answer";
  ALTER TABLE "_pages_v_blocks_faq" DROP COLUMN "highlights_title";`)
}
