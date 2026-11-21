import path from 'path'
import { fileURLToPath } from 'url'

import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-vercel-postgres'

import type { Realisation } from '@/payload-types'

const photosDir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'media')

type Photo = { view: Realisation['photos'][number]['view']; file: string; alt: string }

// Léo's healed results, one per client with all their views, in the order the gallery shows them.
// On a site that already has them, each one is found by any of these photos.
const clients: { photos: Photo[] }[] = [
  {
    photos: [
      {
        view: 'troisQuarts',
        file: 'realisation-effet-rase-1.jpg',
        alt: 'Tricopigmentation effet rasé cicatrisée, vue de trois quarts sur fond gris',
      },
      {
        view: 'face',
        file: 'realisation-effet-rase-1-face.jpg',
        alt: 'Tricopigmentation effet rasé cicatrisée, vue de face, t-shirt rouge',
      },
      {
        view: 'dos',
        file: 'realisation-effet-rase-1-dos.jpg',
        alt: 'Tricopigmentation effet rasé cicatrisée, vue de dos, t-shirt rouge',
      },
    ],
  },
  {
    photos: [
      {
        view: 'troisQuarts',
        file: 'realisation-effet-rase-2-trois-quarts.jpg',
        alt: 'Tricopigmentation effet rasé cicatrisée, vue de trois quarts, t-shirt noir sur fond gris',
      },
      {
        view: 'face',
        file: 'realisation-effet-rase-2.jpg',
        alt: 'Tricopigmentation effet rasé cicatrisée, vue de face sur fond gris',
      },
      {
        view: 'dos',
        file: 'realisation-effet-rase-2-dos.jpg',
        alt: 'Tricopigmentation effet rasé cicatrisée, vue de dos sur fond gris',
      },
    ],
  },
  {
    photos: [
      {
        view: 'troisQuarts',
        file: 'realisation-effet-rase-3-trois-quarts.jpg',
        alt: 'Tricopigmentation effet rasé cicatrisée, vue de trois quarts, barbe rousse',
      },
      {
        view: 'dos',
        file: 'realisation-effet-rase-3.jpg',
        alt: 'Tricopigmentation effet rasé cicatrisée, vue de dos',
      },
    ],
  },
  {
    photos: [
      {
        view: 'troisQuarts',
        file: 'realisation-effet-rase-4.jpg',
        alt: 'Tricopigmentation effet rasé cicatrisée, vue de trois quarts, tête penchée',
      },
      {
        view: 'face',
        file: 'realisation-effet-rase-4-face.jpg',
        alt: 'Tricopigmentation effet rasé cicatrisée, vue de face sur fond blanc',
      },
      {
        view: 'dos',
        file: 'realisation-effet-rase-4-dos.jpg',
        alt: 'Tricopigmentation effet rasé cicatrisée, vue de dos sur fond blanc',
      },
    ],
  },
  {
    photos: [
      {
        view: 'face',
        file: 'realisation-effet-rase-5.jpg',
        alt: 'Tricopigmentation effet rasé cicatrisée, vue de face sur fond vert foncé',
      },
    ],
  },
  {
    photos: [
      {
        view: 'grosPlan',
        file: 'realisation-effet-rase-gros-plan.jpg',
        alt: 'Micro-points de tricopigmentation cicatrisés, en gros plan sur la tempe',
      },
    ],
  },
]

// Replaces each réalisation's single photo with a list of photos, one per view, and gives Léo's six
// healed results all their views. On a site that has no réalisation yet, it creates the six.
// The schema change and the photos run in one transaction: a failure undoes both in the database.
// Photos already sent to the bucket stay, and the next run uploads them again under the same names.
// The file names start with realisation- so that they never replace an image uploaded from the
// production admin: preview deployments upload to the same bucket. For the same reason, deleting
// one of these photos from a preview admin deletes production's file.
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // The existing photo becomes the first of the list. The data below sets its real view.
  await db.execute(sql`
  CREATE TYPE "public"."enum_realisations_photos_view" AS ENUM('face', 'troisQuarts', 'profil', 'dos', 'grosPlan');
  CREATE TABLE "realisations_photos" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"view" "enum_realisations_photos_view" NOT NULL,
  	"image_id" integer NOT NULL
  );
  INSERT INTO "realisations_photos" ("_order", "_parent_id", "id", "view", "image_id")
  	SELECT 1, "id", gen_random_uuid()::text, 'face', "image_id" FROM "realisations";

  ALTER TABLE "realisations" DROP CONSTRAINT "realisations_before_id_media_id_fk";

  ALTER TABLE "realisations" DROP CONSTRAINT "realisations_image_id_media_id_fk";

  DROP INDEX "realisations_before_idx";
  DROP INDEX "realisations_image_idx";
  ALTER TABLE "realisations_photos" ADD CONSTRAINT "realisations_photos_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "realisations_photos" ADD CONSTRAINT "realisations_photos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."realisations"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "realisations_photos_order_idx" ON "realisations_photos" USING btree ("_order");
  CREATE INDEX "realisations_photos_parent_id_idx" ON "realisations_photos" USING btree ("_parent_id");
  CREATE INDEX "realisations_photos_image_idx" ON "realisations_photos" USING btree ("image_id");
  ALTER TABLE "realisations" DROP COLUMN "before_id";
  ALTER TABLE "realisations" DROP COLUMN "image_id";`)

  // Checking for pages with SQL rather than Payload keeps this migration working on a new site
  // after later schema changes
  const { rows: pages } = await db.execute(sql`select 1 from pages limit 1`)
  if (pages.length === 0) return

  const findMedia = async (file: string) =>
    (
      await payload.find({
        collection: 'media',
        depth: 0,
        limit: 1,
        req,
        where: { filename: { equals: file } },
      })
    ).docs[0]?.id

  const photoList = async (photos: Photo[]) => {
    const list = []
    for (const { view, file, alt } of photos) {
      const image =
        (await findMedia(file)) ??
        (
          await payload.create({
            collection: 'media',
            data: { alt },
            depth: 0,
            filePath: path.join(photosDir, file),
            req,
          })
        ).id
      list.push({ view, image })
    }
    return list
  }

  // Migrations run before the build, which renders the gallery anyway
  const context = { disableRevalidate: true }
  const { totalDocs } = await payload.count({ collection: 'realisations', req })

  // One at a time, so that each réalisation goes after the previous one in the gallery
  for (const client of clients) {
    if (totalDocs === 0) {
      await payload.create({
        collection: 'realisations',
        data: { title: 'Effet rasé', photos: await photoList(client.photos) },
        depth: 0,
        req,
        context,
      })
      continue
    }

    const images = []
    for (const { file } of client.photos) {
      const image = await findMedia(file)
      if (image) images.push(image)
    }
    const realisation =
      images.length > 0
        ? (
            await payload.find({
              collection: 'realisations',
              depth: 0,
              limit: 1,
              req,
              where: { 'photos.image': { in: images } },
            })
          ).docs[0]
        : undefined
    if (!realisation) {
      payload.logger.warn(`No réalisation shows ${client.photos[0].file}: its views are not added`)
      continue
    }
    await payload.update({
      collection: 'realisations',
      id: realisation.id,
      data: { title: 'Effet rasé', photos: await photoList(client.photos) },
      depth: 0,
      req,
      context,
    })
  }
}

// Keeps each réalisation's first photo. The other photos stay in Media.
export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "realisations" ADD COLUMN "before_id" integer;
  ALTER TABLE "realisations" ADD COLUMN "image_id" integer;
  UPDATE "realisations" SET "image_id" = (
  	SELECT "image_id" FROM "realisations_photos"
  	WHERE "_parent_id" = "realisations"."id" ORDER BY "_order" LIMIT 1
  );
  ALTER TABLE "realisations" ALTER COLUMN "image_id" SET NOT NULL;
  ALTER TABLE "realisations" ADD CONSTRAINT "realisations_before_id_media_id_fk" FOREIGN KEY ("before_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "realisations" ADD CONSTRAINT "realisations_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "realisations_before_idx" ON "realisations" USING btree ("before_id");
  CREATE INDEX "realisations_image_idx" ON "realisations" USING btree ("image_id");
  ALTER TABLE "realisations_photos" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "realisations_photos" CASCADE;
  DROP TYPE "public"."enum_realisations_photos_view";`)
}
