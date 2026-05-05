import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "payload"."menus_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "payload"."menus" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"handle" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD COLUMN "menus_id" integer;
  ALTER TABLE "payload"."menus_items" ADD CONSTRAINT "menus_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."menus"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "menus_items_order_idx" ON "payload"."menus_items" USING btree ("_order");
  CREATE INDEX "menus_items_parent_id_idx" ON "payload"."menus_items" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "menus_handle_idx" ON "payload"."menus" USING btree ("handle");
  CREATE INDEX "menus_updated_at_idx" ON "payload"."menus" USING btree ("updated_at");
  CREATE INDEX "menus_created_at_idx" ON "payload"."menus" USING btree ("created_at");
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_menus_fk" FOREIGN KEY ("menus_id") REFERENCES "payload"."menus"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_menus_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("menus_id");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payload"."payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_menus_fk";
  ALTER TABLE "payload"."menus_items" DROP CONSTRAINT IF EXISTS "menus_items_parent_id_fk";
  DROP INDEX IF EXISTS "payload"."payload_locked_documents_rels_menus_id_idx";
  DROP INDEX IF EXISTS "payload"."menus_created_at_idx";
  DROP INDEX IF EXISTS "payload"."menus_handle_idx";
  DROP INDEX IF EXISTS "payload"."menus_items_order_idx";
  DROP INDEX IF EXISTS "payload"."menus_items_parent_id_idx";
  DROP INDEX IF EXISTS "payload"."menus_updated_at_idx";
  DROP TABLE IF EXISTS "payload"."menus_items" CASCADE;
  DROP TABLE IF EXISTS "payload"."menus" CASCADE;
  ALTER TABLE "payload"."payload_locked_documents_rels" DROP COLUMN IF EXISTS "menus_id";`)
}
