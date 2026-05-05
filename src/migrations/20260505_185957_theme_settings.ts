import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "payload"."theme_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"active_template_id" integer,
  	"active_theme_id" integer,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "payload"."theme_settings" ADD CONSTRAINT "theme_settings_active_template_id_page_templates_id_fk" FOREIGN KEY ("active_template_id") REFERENCES "payload"."page_templates"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."theme_settings" ADD CONSTRAINT "theme_settings_active_theme_id_themes_id_fk" FOREIGN KEY ("active_theme_id") REFERENCES "payload"."themes"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "theme_settings_active_template_idx" ON "payload"."theme_settings" USING btree ("active_template_id");
  CREATE INDEX "theme_settings_active_theme_idx" ON "payload"."theme_settings" USING btree ("active_theme_id");

  INSERT INTO "payload"."theme_settings" (
    "active_template_id",
    "active_theme_id",
    "updated_at",
    "created_at"
  )
  SELECT
    (SELECT "id" FROM "payload"."page_templates" WHERE "handle" = 'signal-landing' LIMIT 1),
    (SELECT "id" FROM "payload"."themes" WHERE "handle" = 'eltronic-dark' LIMIT 1),
    now(),
    now()
  WHERE NOT EXISTS (SELECT 1 FROM "payload"."theme_settings");

  UPDATE "payload"."theme_settings"
  SET
    "active_template_id" = COALESCE(
      "active_template_id",
      (SELECT "id" FROM "payload"."page_templates" WHERE "handle" = 'signal-landing' LIMIT 1)
    ),
    "active_theme_id" = COALESCE(
      "active_theme_id",
      (SELECT "id" FROM "payload"."themes" WHERE "handle" = 'eltronic-dark' LIMIT 1)
    ),
    "updated_at" = now();`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payload"."theme_settings" DROP CONSTRAINT IF EXISTS "theme_settings_active_template_id_page_templates_id_fk";
  ALTER TABLE "payload"."theme_settings" DROP CONSTRAINT IF EXISTS "theme_settings_active_theme_id_themes_id_fk";
  DROP INDEX IF EXISTS "payload"."theme_settings_active_template_idx";
  DROP INDEX IF EXISTS "payload"."theme_settings_active_theme_idx";
  DROP TABLE IF EXISTS "payload"."theme_settings" CASCADE;`)
}
