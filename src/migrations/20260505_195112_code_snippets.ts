import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "payload"."enum_code_snippets_status" AS ENUM('active', 'draft');
  CREATE TYPE "payload"."enum_code_snippets_scope" AS ENUM('global', 'theme', 'page');
  CREATE TABLE "payload"."code_snippets" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"handle" varchar NOT NULL,
  	"status" "payload"."enum_code_snippets_status" DEFAULT 'draft' NOT NULL,
  	"scope" "payload"."enum_code_snippets_scope" DEFAULT 'global' NOT NULL,
  	"theme_id" integer,
  	"page_id" integer,
  	"priority" numeric DEFAULT 100 NOT NULL,
  	"css" varchar NOT NULL,
  	"notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD COLUMN "code_snippets_id" integer;
  ALTER TABLE "payload"."code_snippets" ADD CONSTRAINT "code_snippets_theme_id_themes_id_fk" FOREIGN KEY ("theme_id") REFERENCES "payload"."themes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."code_snippets" ADD CONSTRAINT "code_snippets_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "payload"."pages"("id") ON DELETE set null ON UPDATE no action;
  CREATE UNIQUE INDEX "code_snippets_handle_idx" ON "payload"."code_snippets" USING btree ("handle");
  CREATE INDEX "code_snippets_status_idx" ON "payload"."code_snippets" USING btree ("status");
  CREATE INDEX "code_snippets_scope_idx" ON "payload"."code_snippets" USING btree ("scope");
  CREATE INDEX "code_snippets_theme_idx" ON "payload"."code_snippets" USING btree ("theme_id");
  CREATE INDEX "code_snippets_page_idx" ON "payload"."code_snippets" USING btree ("page_id");
  CREATE INDEX "code_snippets_priority_idx" ON "payload"."code_snippets" USING btree ("priority");
  CREATE INDEX "code_snippets_updated_at_idx" ON "payload"."code_snippets" USING btree ("updated_at");
  CREATE INDEX "code_snippets_created_at_idx" ON "payload"."code_snippets" USING btree ("created_at");
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_code_snippets_fk" FOREIGN KEY ("code_snippets_id") REFERENCES "payload"."code_snippets"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_code_snippets_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("code_snippets_id");

  INSERT INTO "payload"."code_snippets" (
    "title",
    "handle",
    "status",
    "scope",
    "priority",
    "css",
    "notes"
  )
  VALUES (
    'Example: homepage button polish',
    'example-homepage-button-polish',
    'draft',
    'global',
    100,
    '.puck-actions .puck-button {\n  letter-spacing: 0;\n}',
    'Draft example. Duplicate this snippet, edit the CSS, then set it active when ready.'
  )
  ON CONFLICT ("handle") DO NOTHING;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payload"."payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_code_snippets_fk";
  ALTER TABLE "payload"."code_snippets" DROP CONSTRAINT IF EXISTS "code_snippets_theme_id_themes_id_fk";
  ALTER TABLE "payload"."code_snippets" DROP CONSTRAINT IF EXISTS "code_snippets_page_id_pages_id_fk";
  DROP INDEX IF EXISTS "payload"."payload_locked_documents_rels_code_snippets_id_idx";
  DROP INDEX IF EXISTS "payload"."code_snippets_created_at_idx";
  DROP INDEX IF EXISTS "payload"."code_snippets_handle_idx";
  DROP INDEX IF EXISTS "payload"."code_snippets_page_idx";
  DROP INDEX IF EXISTS "payload"."code_snippets_priority_idx";
  DROP INDEX IF EXISTS "payload"."code_snippets_scope_idx";
  DROP INDEX IF EXISTS "payload"."code_snippets_status_idx";
  DROP INDEX IF EXISTS "payload"."code_snippets_theme_idx";
  DROP INDEX IF EXISTS "payload"."code_snippets_updated_at_idx";
  ALTER TABLE "payload"."payload_locked_documents_rels" DROP COLUMN IF EXISTS "code_snippets_id";
  DROP TABLE IF EXISTS "payload"."code_snippets" CASCADE;
  DROP TYPE IF EXISTS "payload"."enum_code_snippets_status";
  DROP TYPE IF EXISTS "payload"."enum_code_snippets_scope";`)
}
