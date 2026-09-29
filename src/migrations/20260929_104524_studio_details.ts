import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_studio_socials_platform" AS ENUM('instagram', 'facebook', 'youtube');
  CREATE TABLE "studio_socials" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"platform" "enum_studio_socials_platform" NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "studio" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"phone" varchar,
  	"street" varchar,
  	"postal_code" varchar,
  	"city" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "studio_socials" ADD CONSTRAINT "studio_socials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."studio"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "studio_socials_order_idx" ON "studio_socials" USING btree ("_order");
  CREATE INDEX "studio_socials_parent_id_idx" ON "studio_socials" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "studio_socials" CASCADE;
  DROP TABLE "studio" CASCADE;
  DROP TYPE "public"."enum_studio_socials_platform";`)
}
