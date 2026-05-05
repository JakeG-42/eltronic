import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "payload"."enum_themes_status" AS ENUM('active', 'draft');
  CREATE TYPE "payload"."enum_themes_typography_font_family" AS ENUM('display', 'sans', 'code');
  CREATE TYPE "payload"."enum_themes_layout_section_spacing" AS ENUM('compact', 'normal', 'spacious');
  CREATE TYPE "payload"."enum_page_templates_status" AS ENUM('active', 'draft');
  CREATE TABLE "payload"."themes" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"handle" varchar NOT NULL,
  	"status" "payload"."enum_themes_status" DEFAULT 'active' NOT NULL,
  	"is_default" boolean DEFAULT false,
  	"description" varchar,
  	"colors_background_color" varchar DEFAULT '#020617' NOT NULL,
  	"colors_text_color" varchar DEFAULT '#f1f5f9' NOT NULL,
  	"colors_accent_color" varchar DEFAULT '#8bd3ff' NOT NULL,
  	"colors_surface_color" varchar DEFAULT '23, 32, 51' NOT NULL,
  	"colors_surface_opacity" numeric DEFAULT 0.78 NOT NULL,
  	"typography_font_family" "payload"."enum_themes_typography_font_family" DEFAULT 'display' NOT NULL,
  	"layout_section_spacing" "payload"."enum_themes_layout_section_spacing" DEFAULT 'normal' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload"."page_templates" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"handle" varchar NOT NULL,
  	"status" "payload"."enum_page_templates_status" DEFAULT 'active' NOT NULL,
  	"description" varchar,
  	"theme_id" integer,
  	"builder_data" jsonb NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload"."pages" ADD COLUMN "theme_id" integer;
  ALTER TABLE "payload"."pages" ADD COLUMN "page_template_id" integer;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD COLUMN "themes_id" integer;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD COLUMN "page_templates_id" integer;
  ALTER TABLE "payload"."page_templates" ADD CONSTRAINT "page_templates_theme_id_themes_id_fk" FOREIGN KEY ("theme_id") REFERENCES "payload"."themes"("id") ON DELETE set null ON UPDATE no action;
  CREATE UNIQUE INDEX "themes_handle_idx" ON "payload"."themes" USING btree ("handle");
  CREATE INDEX "themes_status_idx" ON "payload"."themes" USING btree ("status");
  CREATE INDEX "themes_updated_at_idx" ON "payload"."themes" USING btree ("updated_at");
  CREATE INDEX "themes_created_at_idx" ON "payload"."themes" USING btree ("created_at");
  CREATE UNIQUE INDEX "page_templates_handle_idx" ON "payload"."page_templates" USING btree ("handle");
  CREATE INDEX "page_templates_status_idx" ON "payload"."page_templates" USING btree ("status");
  CREATE INDEX "page_templates_theme_idx" ON "payload"."page_templates" USING btree ("theme_id");
  CREATE INDEX "page_templates_updated_at_idx" ON "payload"."page_templates" USING btree ("updated_at");
  CREATE INDEX "page_templates_created_at_idx" ON "payload"."page_templates" USING btree ("created_at");
  ALTER TABLE "payload"."pages" ADD CONSTRAINT "pages_theme_id_themes_id_fk" FOREIGN KEY ("theme_id") REFERENCES "payload"."themes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."pages" ADD CONSTRAINT "pages_page_template_id_page_templates_id_fk" FOREIGN KEY ("page_template_id") REFERENCES "payload"."page_templates"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_themes_fk" FOREIGN KEY ("themes_id") REFERENCES "payload"."themes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_page_templates_fk" FOREIGN KEY ("page_templates_id") REFERENCES "payload"."page_templates"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_theme_idx" ON "payload"."pages" USING btree ("theme_id");
  CREATE INDEX "pages_page_template_idx" ON "payload"."pages" USING btree ("page_template_id");
  CREATE INDEX "payload_locked_documents_rels_themes_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("themes_id");
  CREATE INDEX "payload_locked_documents_rels_page_templates_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("page_templates_id");

  INSERT INTO "payload"."themes" (
    "name",
    "handle",
    "status",
    "is_default",
    "description",
    "colors_background_color",
    "colors_text_color",
    "colors_accent_color",
    "colors_surface_color",
    "colors_surface_opacity",
    "typography_font_family",
    "layout_section_spacing"
  )
  VALUES
    (
      'Eltronic Dark',
      'eltronic-dark',
      'active',
      true,
      'Current Eltronic dark visual language for the Payload-built site.',
      '#020617',
      '#f1f5f9',
      '#8bd3ff',
      '23, 32, 51',
      0.78,
      'display',
      'normal'
    ),
    (
      'Signal Light',
      'signal-light',
      'active',
      false,
      'A lighter starter theme based on the current Eltronic structure, with fresh colours and typography.',
      '#f7f8fb',
      '#102033',
      '#0f766e',
      '255, 255, 255',
      0.92,
      'sans',
      'spacious'
    )
  ON CONFLICT ("handle") DO UPDATE SET
    "name" = EXCLUDED."name",
    "status" = EXCLUDED."status",
    "description" = EXCLUDED."description",
    "colors_background_color" = EXCLUDED."colors_background_color",
    "colors_text_color" = EXCLUDED."colors_text_color",
    "colors_accent_color" = EXCLUDED."colors_accent_color",
    "colors_surface_color" = EXCLUDED."colors_surface_color",
    "colors_surface_opacity" = EXCLUDED."colors_surface_opacity",
    "typography_font_family" = EXCLUDED."typography_font_family",
    "layout_section_spacing" = EXCLUDED."layout_section_spacing",
    "updated_at" = now();

  INSERT INTO "payload"."page_templates" (
    "name",
    "handle",
    "status",
    "description",
    "theme_id",
    "builder_data"
  )
  VALUES (
    'Signal Landing',
    'signal-landing',
    'active',
    'Starter WYSIWYG page template using the Signal Light theme.',
    (SELECT "id" FROM "payload"."themes" WHERE "handle" = 'signal-light' LIMIT 1),
    $builder$
    {
      "content": [
        {
          "type": "SiteHeaderBlock",
          "props": {
            "id": "template-header",
            "brandLabel": "ELTRONIC",
            "menuHandle": "primary",
            "ctaLabel": "Contact",
            "ctaUrl": "/contact",
            "fullWidth": true,
            "sticky": false
          }
        },
        {
          "type": "HeroBlock",
          "props": {
            "id": "template-hero",
            "eyebrow": "Signal Light",
            "heading": "Build a clearer technical story",
            "lede": "A lighter starter theme for the new Payload-built Eltronic site.",
            "primaryLabel": "Start editing",
            "primaryUrl": "#",
            "secondaryLabel": "View products",
            "secondaryUrl": "/products"
          }
        },
        {
          "type": "SectionBlock",
          "props": {
            "id": "template-section",
            "eyebrow": "Reusable section",
            "heading": "Shape this template in the WYSIWYG editor",
            "body": "Use this starter as a base, then swap sections, adjust spacing, colours and hover effects.",
            "primaryLabel": "Add content",
            "primaryUrl": "#",
            "secondaryLabel": "",
            "secondaryUrl": "",
            "variant": "panel"
          }
        }
      ],
      "root": {
        "props": {
          "accentColor": "#0f766e",
          "backgroundColor": "#f7f8fb",
          "fontFamily": "sans",
          "pageTitle": "Signal Landing",
          "sectionSpacing": "spacious",
          "surfaceColor": "255, 255, 255",
          "surfaceOpacity": 0.92,
          "textColor": "#102033",
          "themeHandle": "signal-light",
          "themeId": "signal-light",
          "themeName": "Signal Light",
          "themePreset": "precisionLight"
        }
      },
      "zones": {}
    }
    $builder$::jsonb
  )
  ON CONFLICT ("handle") DO UPDATE SET
    "name" = EXCLUDED."name",
    "status" = EXCLUDED."status",
    "description" = EXCLUDED."description",
    "theme_id" = EXCLUDED."theme_id",
    "builder_data" = EXCLUDED."builder_data",
    "updated_at" = now();`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payload"."pages" DROP CONSTRAINT IF EXISTS "pages_theme_id_themes_id_fk";
  ALTER TABLE "payload"."pages" DROP CONSTRAINT IF EXISTS "pages_page_template_id_page_templates_id_fk";
  ALTER TABLE "payload"."payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_themes_fk";
  ALTER TABLE "payload"."payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_page_templates_fk";
  ALTER TABLE "payload"."page_templates" DROP CONSTRAINT IF EXISTS "page_templates_theme_id_themes_id_fk";
  DROP INDEX IF EXISTS "payload"."pages_theme_idx";
  DROP INDEX IF EXISTS "payload"."pages_page_template_idx";
  DROP INDEX IF EXISTS "payload"."payload_locked_documents_rels_themes_id_idx";
  DROP INDEX IF EXISTS "payload"."payload_locked_documents_rels_page_templates_id_idx";
  DROP INDEX IF EXISTS "payload"."page_templates_created_at_idx";
  DROP INDEX IF EXISTS "payload"."page_templates_handle_idx";
  DROP INDEX IF EXISTS "payload"."page_templates_status_idx";
  DROP INDEX IF EXISTS "payload"."page_templates_theme_idx";
  DROP INDEX IF EXISTS "payload"."page_templates_updated_at_idx";
  DROP INDEX IF EXISTS "payload"."themes_created_at_idx";
  DROP INDEX IF EXISTS "payload"."themes_handle_idx";
  DROP INDEX IF EXISTS "payload"."themes_status_idx";
  DROP INDEX IF EXISTS "payload"."themes_updated_at_idx";
  ALTER TABLE "payload"."pages" DROP COLUMN IF EXISTS "theme_id";
  ALTER TABLE "payload"."pages" DROP COLUMN IF EXISTS "page_template_id";
  ALTER TABLE "payload"."payload_locked_documents_rels" DROP COLUMN IF EXISTS "themes_id";
  ALTER TABLE "payload"."payload_locked_documents_rels" DROP COLUMN IF EXISTS "page_templates_id";
  DROP TABLE IF EXISTS "payload"."page_templates" CASCADE;
  DROP TABLE IF EXISTS "payload"."themes" CASCADE;
  DROP TYPE IF EXISTS "payload"."enum_themes_status";
  DROP TYPE IF EXISTS "payload"."enum_themes_typography_font_family";
  DROP TYPE IF EXISTS "payload"."enum_themes_layout_section_spacing";
  DROP TYPE IF EXISTS "payload"."enum_page_templates_status";`)
}
