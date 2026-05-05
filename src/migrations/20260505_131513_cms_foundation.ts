import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "payload"."enum_products_status" AS ENUM('draft', 'published');
  CREATE TYPE "payload"."enum_products_template" AS ENUM('hmi', 'data-logger', 'module');
  CREATE TYPE "payload"."enum_pages_blocks_image_text_image_side" AS ENUM('left', 'right');
  CREATE TYPE "payload"."enum_pages_blocks_product_grid_mode" AS ENUM('featured', 'manual');
  CREATE TYPE "payload"."enum_posts_blocks_image_text_image_side" AS ENUM('left', 'right');
  CREATE TYPE "payload"."enum_posts_blocks_product_grid_mode" AS ENUM('featured', 'manual');
  CREATE TYPE "payload"."enum_posts_status" AS ENUM('draft', 'published');
  CREATE TABLE "payload"."media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar NOT NULL,
  	"caption" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "payload"."documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"description" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "payload"."product_categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"description" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload"."products_highlights" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL
  );
  
  CREATE TABLE "payload"."products_specifications" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"value" varchar NOT NULL
  );
  
  CREATE TABLE "payload"."products_variants" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"details" varchar,
  	"sku" varchar,
  	"article_number" varchar,
  	"price" varchar
  );
  
  CREATE TABLE "payload"."products" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"status" "payload"."enum_products_status" DEFAULT 'draft' NOT NULL,
  	"featured" boolean DEFAULT false,
  	"category_id" integer,
  	"family" varchar NOT NULL,
  	"template" "payload"."enum_products_template" DEFAULT 'hmi' NOT NULL,
  	"summary" varchar NOT NULL,
  	"description" jsonb NOT NULL,
  	"enquiry_prompt" varchar DEFAULT 'Discuss this product' NOT NULL,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"seo_image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload"."products_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer,
  	"documents_id" integer
  );
  
  CREATE TABLE "payload"."pages_blocks_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar NOT NULL,
  	"lede" varchar,
  	"image_id" integer,
  	"primary_link_label" varchar,
  	"primary_link_url" varchar,
  	"secondary_link_label" varchar,
  	"secondary_link_url" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "payload"."pages_blocks_rich_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"content" jsonb NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "payload"."pages_blocks_image_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar NOT NULL,
  	"body" varchar,
  	"image_id" integer NOT NULL,
  	"image_side" "payload"."enum_pages_blocks_image_text_image_side" DEFAULT 'right' NOT NULL,
  	"link_label" varchar,
  	"link_url" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "payload"."pages_blocks_card_grid_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"body" varchar,
  	"link_label" varchar,
  	"link_url" varchar
  );
  
  CREATE TABLE "payload"."pages_blocks_card_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar NOT NULL,
  	"intro" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "payload"."pages_blocks_product_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar NOT NULL,
  	"intro" varchar,
  	"mode" "payload"."enum_pages_blocks_product_grid_mode" DEFAULT 'featured' NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "payload"."pages_blocks_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "payload"."pages_blocks_downloads" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "payload"."pages_blocks_spec_table_rows" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"value" varchar NOT NULL
  );
  
  CREATE TABLE "payload"."pages_blocks_spec_table" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "payload"."pages_blocks_call_to_action" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar NOT NULL,
  	"body" varchar,
  	"primary_link_label" varchar,
  	"primary_link_url" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "payload"."pages_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"products_id" integer,
  	"media_id" integer,
  	"documents_id" integer
  );
  
  CREATE TABLE "payload"."posts_blocks_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar NOT NULL,
  	"lede" varchar,
  	"image_id" integer,
  	"primary_link_label" varchar,
  	"primary_link_url" varchar,
  	"secondary_link_label" varchar,
  	"secondary_link_url" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "payload"."posts_blocks_rich_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"content" jsonb NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "payload"."posts_blocks_image_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar NOT NULL,
  	"body" varchar,
  	"image_id" integer NOT NULL,
  	"image_side" "payload"."enum_posts_blocks_image_text_image_side" DEFAULT 'right' NOT NULL,
  	"link_label" varchar,
  	"link_url" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "payload"."posts_blocks_card_grid_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"body" varchar,
  	"link_label" varchar,
  	"link_url" varchar
  );
  
  CREATE TABLE "payload"."posts_blocks_card_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar NOT NULL,
  	"intro" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "payload"."posts_blocks_product_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar NOT NULL,
  	"intro" varchar,
  	"mode" "payload"."enum_posts_blocks_product_grid_mode" DEFAULT 'featured' NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "payload"."posts_blocks_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "payload"."posts_blocks_downloads" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "payload"."posts_blocks_spec_table_rows" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"value" varchar NOT NULL
  );
  
  CREATE TABLE "payload"."posts_blocks_spec_table" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "payload"."posts_blocks_call_to_action" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar NOT NULL,
  	"body" varchar,
  	"primary_link_label" varchar,
  	"primary_link_url" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "payload"."posts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"summary" varchar NOT NULL,
  	"status" "payload"."enum_posts_status" DEFAULT 'draft' NOT NULL,
  	"published_at" timestamp(3) with time zone,
  	"featured_image_id" integer,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"seo_image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload"."posts_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"products_id" integer,
  	"media_id" integer,
  	"documents_id" integer
  );
  
  CREATE TABLE "payload"."site_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"site_name" varchar DEFAULT 'Eltronic' NOT NULL,
  	"strapline" varchar,
  	"contact_email" varchar,
  	"contact_phone" varchar,
  	"logo_id" integer,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"seo_image_id" integer,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "payload"."navigation_primary" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "payload"."navigation_utility" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "payload"."navigation" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "payload"."footer_link_groups_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "payload"."footer_link_groups" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar NOT NULL
  );
  
  CREATE TABLE "payload"."footer_legal_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "payload"."footer" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"intro" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "payload"."console_users" ALTER COLUMN "role" SET DEFAULT 'admin';
  ALTER TABLE "payload"."pages" ADD COLUMN "summary" varchar;
  ALTER TABLE "payload"."pages" ADD COLUMN "seo_title" varchar;
  ALTER TABLE "payload"."pages" ADD COLUMN "seo_description" varchar;
  ALTER TABLE "payload"."pages" ADD COLUMN "seo_image_id" integer;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD COLUMN "media_id" integer;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD COLUMN "documents_id" integer;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD COLUMN "product_categories_id" integer;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD COLUMN "products_id" integer;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD COLUMN "posts_id" integer;
  ALTER TABLE "payload"."products_highlights" ADD CONSTRAINT "products_highlights_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."products_specifications" ADD CONSTRAINT "products_specifications_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."products_variants" ADD CONSTRAINT "products_variants_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."products" ADD CONSTRAINT "products_category_id_product_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "payload"."product_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."products" ADD CONSTRAINT "products_seo_image_id_media_id_fk" FOREIGN KEY ("seo_image_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."products_rels" ADD CONSTRAINT "products_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."products_rels" ADD CONSTRAINT "products_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "payload"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."products_rels" ADD CONSTRAINT "products_rels_documents_fk" FOREIGN KEY ("documents_id") REFERENCES "payload"."documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."pages_blocks_hero" ADD CONSTRAINT "pages_blocks_hero_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."pages_blocks_hero" ADD CONSTRAINT "pages_blocks_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."pages_blocks_rich_text" ADD CONSTRAINT "pages_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."pages_blocks_image_text" ADD CONSTRAINT "pages_blocks_image_text_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."pages_blocks_image_text" ADD CONSTRAINT "pages_blocks_image_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."pages_blocks_card_grid_cards" ADD CONSTRAINT "pages_blocks_card_grid_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."pages_blocks_card_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."pages_blocks_card_grid" ADD CONSTRAINT "pages_blocks_card_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."pages_blocks_product_grid" ADD CONSTRAINT "pages_blocks_product_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."pages_blocks_gallery" ADD CONSTRAINT "pages_blocks_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."pages_blocks_downloads" ADD CONSTRAINT "pages_blocks_downloads_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."pages_blocks_spec_table_rows" ADD CONSTRAINT "pages_blocks_spec_table_rows_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."pages_blocks_spec_table"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."pages_blocks_spec_table" ADD CONSTRAINT "pages_blocks_spec_table_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."pages_blocks_call_to_action" ADD CONSTRAINT "pages_blocks_call_to_action_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."pages_rels" ADD CONSTRAINT "pages_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."pages_rels" ADD CONSTRAINT "pages_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "payload"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."pages_rels" ADD CONSTRAINT "pages_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "payload"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."pages_rels" ADD CONSTRAINT "pages_rels_documents_fk" FOREIGN KEY ("documents_id") REFERENCES "payload"."documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."posts_blocks_hero" ADD CONSTRAINT "posts_blocks_hero_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."posts_blocks_hero" ADD CONSTRAINT "posts_blocks_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."posts_blocks_rich_text" ADD CONSTRAINT "posts_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."posts_blocks_image_text" ADD CONSTRAINT "posts_blocks_image_text_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."posts_blocks_image_text" ADD CONSTRAINT "posts_blocks_image_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."posts_blocks_card_grid_cards" ADD CONSTRAINT "posts_blocks_card_grid_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."posts_blocks_card_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."posts_blocks_card_grid" ADD CONSTRAINT "posts_blocks_card_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."posts_blocks_product_grid" ADD CONSTRAINT "posts_blocks_product_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."posts_blocks_gallery" ADD CONSTRAINT "posts_blocks_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."posts_blocks_downloads" ADD CONSTRAINT "posts_blocks_downloads_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."posts_blocks_spec_table_rows" ADD CONSTRAINT "posts_blocks_spec_table_rows_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."posts_blocks_spec_table"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."posts_blocks_spec_table" ADD CONSTRAINT "posts_blocks_spec_table_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."posts_blocks_call_to_action" ADD CONSTRAINT "posts_blocks_call_to_action_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."posts" ADD CONSTRAINT "posts_featured_image_id_media_id_fk" FOREIGN KEY ("featured_image_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."posts" ADD CONSTRAINT "posts_seo_image_id_media_id_fk" FOREIGN KEY ("seo_image_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."posts_rels" ADD CONSTRAINT "posts_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."posts_rels" ADD CONSTRAINT "posts_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "payload"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."posts_rels" ADD CONSTRAINT "posts_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "payload"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."posts_rels" ADD CONSTRAINT "posts_rels_documents_fk" FOREIGN KEY ("documents_id") REFERENCES "payload"."documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."site_settings" ADD CONSTRAINT "site_settings_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."site_settings" ADD CONSTRAINT "site_settings_seo_image_id_media_id_fk" FOREIGN KEY ("seo_image_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."navigation_primary" ADD CONSTRAINT "navigation_primary_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."navigation"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."navigation_utility" ADD CONSTRAINT "navigation_utility_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."navigation"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."footer_link_groups_links" ADD CONSTRAINT "footer_link_groups_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."footer_link_groups"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."footer_link_groups" ADD CONSTRAINT "footer_link_groups_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."footer_legal_links" ADD CONSTRAINT "footer_legal_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."footer"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "media_updated_at_idx" ON "payload"."media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "payload"."media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "payload"."media" USING btree ("filename");
  CREATE INDEX "documents_updated_at_idx" ON "payload"."documents" USING btree ("updated_at");
  CREATE INDEX "documents_created_at_idx" ON "payload"."documents" USING btree ("created_at");
  CREATE UNIQUE INDEX "documents_filename_idx" ON "payload"."documents" USING btree ("filename");
  CREATE UNIQUE INDEX "product_categories_slug_idx" ON "payload"."product_categories" USING btree ("slug");
  CREATE INDEX "product_categories_updated_at_idx" ON "payload"."product_categories" USING btree ("updated_at");
  CREATE INDEX "product_categories_created_at_idx" ON "payload"."product_categories" USING btree ("created_at");
  CREATE INDEX "products_highlights_order_idx" ON "payload"."products_highlights" USING btree ("_order");
  CREATE INDEX "products_highlights_parent_id_idx" ON "payload"."products_highlights" USING btree ("_parent_id");
  CREATE INDEX "products_specifications_order_idx" ON "payload"."products_specifications" USING btree ("_order");
  CREATE INDEX "products_specifications_parent_id_idx" ON "payload"."products_specifications" USING btree ("_parent_id");
  CREATE INDEX "products_variants_order_idx" ON "payload"."products_variants" USING btree ("_order");
  CREATE INDEX "products_variants_parent_id_idx" ON "payload"."products_variants" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "products_slug_idx" ON "payload"."products" USING btree ("slug");
  CREATE INDEX "products_status_idx" ON "payload"."products" USING btree ("status");
  CREATE INDEX "products_category_idx" ON "payload"."products" USING btree ("category_id");
  CREATE INDEX "products_seo_seo_image_idx" ON "payload"."products" USING btree ("seo_image_id");
  CREATE INDEX "products_updated_at_idx" ON "payload"."products" USING btree ("updated_at");
  CREATE INDEX "products_created_at_idx" ON "payload"."products" USING btree ("created_at");
  CREATE INDEX "products_rels_order_idx" ON "payload"."products_rels" USING btree ("order");
  CREATE INDEX "products_rels_parent_idx" ON "payload"."products_rels" USING btree ("parent_id");
  CREATE INDEX "products_rels_path_idx" ON "payload"."products_rels" USING btree ("path");
  CREATE INDEX "products_rels_media_id_idx" ON "payload"."products_rels" USING btree ("media_id");
  CREATE INDEX "products_rels_documents_id_idx" ON "payload"."products_rels" USING btree ("documents_id");
  CREATE INDEX "pages_blocks_hero_order_idx" ON "payload"."pages_blocks_hero" USING btree ("_order");
  CREATE INDEX "pages_blocks_hero_parent_id_idx" ON "payload"."pages_blocks_hero" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_hero_path_idx" ON "payload"."pages_blocks_hero" USING btree ("_path");
  CREATE INDEX "pages_blocks_hero_image_idx" ON "payload"."pages_blocks_hero" USING btree ("image_id");
  CREATE INDEX "pages_blocks_rich_text_order_idx" ON "payload"."pages_blocks_rich_text" USING btree ("_order");
  CREATE INDEX "pages_blocks_rich_text_parent_id_idx" ON "payload"."pages_blocks_rich_text" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_rich_text_path_idx" ON "payload"."pages_blocks_rich_text" USING btree ("_path");
  CREATE INDEX "pages_blocks_image_text_order_idx" ON "payload"."pages_blocks_image_text" USING btree ("_order");
  CREATE INDEX "pages_blocks_image_text_parent_id_idx" ON "payload"."pages_blocks_image_text" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_image_text_path_idx" ON "payload"."pages_blocks_image_text" USING btree ("_path");
  CREATE INDEX "pages_blocks_image_text_image_idx" ON "payload"."pages_blocks_image_text" USING btree ("image_id");
  CREATE INDEX "pages_blocks_card_grid_cards_order_idx" ON "payload"."pages_blocks_card_grid_cards" USING btree ("_order");
  CREATE INDEX "pages_blocks_card_grid_cards_parent_id_idx" ON "payload"."pages_blocks_card_grid_cards" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_card_grid_order_idx" ON "payload"."pages_blocks_card_grid" USING btree ("_order");
  CREATE INDEX "pages_blocks_card_grid_parent_id_idx" ON "payload"."pages_blocks_card_grid" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_card_grid_path_idx" ON "payload"."pages_blocks_card_grid" USING btree ("_path");
  CREATE INDEX "pages_blocks_product_grid_order_idx" ON "payload"."pages_blocks_product_grid" USING btree ("_order");
  CREATE INDEX "pages_blocks_product_grid_parent_id_idx" ON "payload"."pages_blocks_product_grid" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_product_grid_path_idx" ON "payload"."pages_blocks_product_grid" USING btree ("_path");
  CREATE INDEX "pages_blocks_gallery_order_idx" ON "payload"."pages_blocks_gallery" USING btree ("_order");
  CREATE INDEX "pages_blocks_gallery_parent_id_idx" ON "payload"."pages_blocks_gallery" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_gallery_path_idx" ON "payload"."pages_blocks_gallery" USING btree ("_path");
  CREATE INDEX "pages_blocks_downloads_order_idx" ON "payload"."pages_blocks_downloads" USING btree ("_order");
  CREATE INDEX "pages_blocks_downloads_parent_id_idx" ON "payload"."pages_blocks_downloads" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_downloads_path_idx" ON "payload"."pages_blocks_downloads" USING btree ("_path");
  CREATE INDEX "pages_blocks_spec_table_rows_order_idx" ON "payload"."pages_blocks_spec_table_rows" USING btree ("_order");
  CREATE INDEX "pages_blocks_spec_table_rows_parent_id_idx" ON "payload"."pages_blocks_spec_table_rows" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_spec_table_order_idx" ON "payload"."pages_blocks_spec_table" USING btree ("_order");
  CREATE INDEX "pages_blocks_spec_table_parent_id_idx" ON "payload"."pages_blocks_spec_table" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_spec_table_path_idx" ON "payload"."pages_blocks_spec_table" USING btree ("_path");
  CREATE INDEX "pages_blocks_call_to_action_order_idx" ON "payload"."pages_blocks_call_to_action" USING btree ("_order");
  CREATE INDEX "pages_blocks_call_to_action_parent_id_idx" ON "payload"."pages_blocks_call_to_action" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_call_to_action_path_idx" ON "payload"."pages_blocks_call_to_action" USING btree ("_path");
  CREATE INDEX "pages_rels_order_idx" ON "payload"."pages_rels" USING btree ("order");
  CREATE INDEX "pages_rels_parent_idx" ON "payload"."pages_rels" USING btree ("parent_id");
  CREATE INDEX "pages_rels_path_idx" ON "payload"."pages_rels" USING btree ("path");
  CREATE INDEX "pages_rels_products_id_idx" ON "payload"."pages_rels" USING btree ("products_id");
  CREATE INDEX "pages_rels_media_id_idx" ON "payload"."pages_rels" USING btree ("media_id");
  CREATE INDEX "pages_rels_documents_id_idx" ON "payload"."pages_rels" USING btree ("documents_id");
  CREATE INDEX "posts_blocks_hero_order_idx" ON "payload"."posts_blocks_hero" USING btree ("_order");
  CREATE INDEX "posts_blocks_hero_parent_id_idx" ON "payload"."posts_blocks_hero" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_hero_path_idx" ON "payload"."posts_blocks_hero" USING btree ("_path");
  CREATE INDEX "posts_blocks_hero_image_idx" ON "payload"."posts_blocks_hero" USING btree ("image_id");
  CREATE INDEX "posts_blocks_rich_text_order_idx" ON "payload"."posts_blocks_rich_text" USING btree ("_order");
  CREATE INDEX "posts_blocks_rich_text_parent_id_idx" ON "payload"."posts_blocks_rich_text" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_rich_text_path_idx" ON "payload"."posts_blocks_rich_text" USING btree ("_path");
  CREATE INDEX "posts_blocks_image_text_order_idx" ON "payload"."posts_blocks_image_text" USING btree ("_order");
  CREATE INDEX "posts_blocks_image_text_parent_id_idx" ON "payload"."posts_blocks_image_text" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_image_text_path_idx" ON "payload"."posts_blocks_image_text" USING btree ("_path");
  CREATE INDEX "posts_blocks_image_text_image_idx" ON "payload"."posts_blocks_image_text" USING btree ("image_id");
  CREATE INDEX "posts_blocks_card_grid_cards_order_idx" ON "payload"."posts_blocks_card_grid_cards" USING btree ("_order");
  CREATE INDEX "posts_blocks_card_grid_cards_parent_id_idx" ON "payload"."posts_blocks_card_grid_cards" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_card_grid_order_idx" ON "payload"."posts_blocks_card_grid" USING btree ("_order");
  CREATE INDEX "posts_blocks_card_grid_parent_id_idx" ON "payload"."posts_blocks_card_grid" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_card_grid_path_idx" ON "payload"."posts_blocks_card_grid" USING btree ("_path");
  CREATE INDEX "posts_blocks_product_grid_order_idx" ON "payload"."posts_blocks_product_grid" USING btree ("_order");
  CREATE INDEX "posts_blocks_product_grid_parent_id_idx" ON "payload"."posts_blocks_product_grid" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_product_grid_path_idx" ON "payload"."posts_blocks_product_grid" USING btree ("_path");
  CREATE INDEX "posts_blocks_gallery_order_idx" ON "payload"."posts_blocks_gallery" USING btree ("_order");
  CREATE INDEX "posts_blocks_gallery_parent_id_idx" ON "payload"."posts_blocks_gallery" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_gallery_path_idx" ON "payload"."posts_blocks_gallery" USING btree ("_path");
  CREATE INDEX "posts_blocks_downloads_order_idx" ON "payload"."posts_blocks_downloads" USING btree ("_order");
  CREATE INDEX "posts_blocks_downloads_parent_id_idx" ON "payload"."posts_blocks_downloads" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_downloads_path_idx" ON "payload"."posts_blocks_downloads" USING btree ("_path");
  CREATE INDEX "posts_blocks_spec_table_rows_order_idx" ON "payload"."posts_blocks_spec_table_rows" USING btree ("_order");
  CREATE INDEX "posts_blocks_spec_table_rows_parent_id_idx" ON "payload"."posts_blocks_spec_table_rows" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_spec_table_order_idx" ON "payload"."posts_blocks_spec_table" USING btree ("_order");
  CREATE INDEX "posts_blocks_spec_table_parent_id_idx" ON "payload"."posts_blocks_spec_table" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_spec_table_path_idx" ON "payload"."posts_blocks_spec_table" USING btree ("_path");
  CREATE INDEX "posts_blocks_call_to_action_order_idx" ON "payload"."posts_blocks_call_to_action" USING btree ("_order");
  CREATE INDEX "posts_blocks_call_to_action_parent_id_idx" ON "payload"."posts_blocks_call_to_action" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_call_to_action_path_idx" ON "payload"."posts_blocks_call_to_action" USING btree ("_path");
  CREATE UNIQUE INDEX "posts_slug_idx" ON "payload"."posts" USING btree ("slug");
  CREATE INDEX "posts_status_idx" ON "payload"."posts" USING btree ("status");
  CREATE INDEX "posts_featured_image_idx" ON "payload"."posts" USING btree ("featured_image_id");
  CREATE INDEX "posts_seo_seo_image_idx" ON "payload"."posts" USING btree ("seo_image_id");
  CREATE INDEX "posts_updated_at_idx" ON "payload"."posts" USING btree ("updated_at");
  CREATE INDEX "posts_created_at_idx" ON "payload"."posts" USING btree ("created_at");
  CREATE INDEX "posts_rels_order_idx" ON "payload"."posts_rels" USING btree ("order");
  CREATE INDEX "posts_rels_parent_idx" ON "payload"."posts_rels" USING btree ("parent_id");
  CREATE INDEX "posts_rels_path_idx" ON "payload"."posts_rels" USING btree ("path");
  CREATE INDEX "posts_rels_products_id_idx" ON "payload"."posts_rels" USING btree ("products_id");
  CREATE INDEX "posts_rels_media_id_idx" ON "payload"."posts_rels" USING btree ("media_id");
  CREATE INDEX "posts_rels_documents_id_idx" ON "payload"."posts_rels" USING btree ("documents_id");
  CREATE INDEX "site_settings_logo_idx" ON "payload"."site_settings" USING btree ("logo_id");
  CREATE INDEX "site_settings_seo_seo_image_idx" ON "payload"."site_settings" USING btree ("seo_image_id");
  CREATE INDEX "navigation_primary_order_idx" ON "payload"."navigation_primary" USING btree ("_order");
  CREATE INDEX "navigation_primary_parent_id_idx" ON "payload"."navigation_primary" USING btree ("_parent_id");
  CREATE INDEX "navigation_utility_order_idx" ON "payload"."navigation_utility" USING btree ("_order");
  CREATE INDEX "navigation_utility_parent_id_idx" ON "payload"."navigation_utility" USING btree ("_parent_id");
  CREATE INDEX "footer_link_groups_links_order_idx" ON "payload"."footer_link_groups_links" USING btree ("_order");
  CREATE INDEX "footer_link_groups_links_parent_id_idx" ON "payload"."footer_link_groups_links" USING btree ("_parent_id");
  CREATE INDEX "footer_link_groups_order_idx" ON "payload"."footer_link_groups" USING btree ("_order");
  CREATE INDEX "footer_link_groups_parent_id_idx" ON "payload"."footer_link_groups" USING btree ("_parent_id");
  CREATE INDEX "footer_legal_links_order_idx" ON "payload"."footer_legal_links" USING btree ("_order");
  CREATE INDEX "footer_legal_links_parent_id_idx" ON "payload"."footer_legal_links" USING btree ("_parent_id");
  ALTER TABLE "payload"."pages" ADD CONSTRAINT "pages_seo_image_id_media_id_fk" FOREIGN KEY ("seo_image_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "payload"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_documents_fk" FOREIGN KEY ("documents_id") REFERENCES "payload"."documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_product_categories_fk" FOREIGN KEY ("product_categories_id") REFERENCES "payload"."product_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "payload"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "payload"."posts"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_status_idx" ON "payload"."pages" USING btree ("status");
  CREATE INDEX "pages_seo_seo_image_idx" ON "payload"."pages" USING btree ("seo_image_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_documents_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("documents_id");
  CREATE INDEX "payload_locked_documents_rels_product_categories_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("product_categories_id");
  CREATE INDEX "payload_locked_documents_rels_products_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("products_id");
  CREATE INDEX "payload_locked_documents_rels_posts_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("posts_id");
  UPDATE "payload"."pages"
  SET "summary" = COALESCE(NULLIF("summary", ''), NULLIF("body", ''), NULLIF("hero_heading", ''))
  WHERE "summary" IS NULL OR "summary" = '';
  INSERT INTO "payload"."pages_blocks_hero" ("_order", "_parent_id", "_path", "id", "heading", "lede")
  SELECT
    0,
    "id",
    'layout',
    'migrated-hero-' || "id"::text,
    COALESCE(NULLIF("hero_heading", ''), "title"),
    NULLIF("body", '')
  FROM "payload"."pages"
  WHERE NULLIF("hero_heading", '') IS NOT NULL OR NULLIF("body", '') IS NOT NULL;
  ALTER TABLE "payload"."pages" DROP COLUMN "hero_heading";
  ALTER TABLE "payload"."pages" DROP COLUMN "body";`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payload"."media" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."documents" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."product_categories" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."products_highlights" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."products_specifications" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."products_variants" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."products" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."products_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."pages_blocks_hero" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."pages_blocks_rich_text" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."pages_blocks_image_text" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."pages_blocks_card_grid_cards" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."pages_blocks_card_grid" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."pages_blocks_product_grid" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."pages_blocks_gallery" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."pages_blocks_downloads" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."pages_blocks_spec_table_rows" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."pages_blocks_spec_table" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."pages_blocks_call_to_action" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."pages_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."posts_blocks_hero" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."posts_blocks_rich_text" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."posts_blocks_image_text" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."posts_blocks_card_grid_cards" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."posts_blocks_card_grid" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."posts_blocks_product_grid" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."posts_blocks_gallery" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."posts_blocks_downloads" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."posts_blocks_spec_table_rows" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."posts_blocks_spec_table" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."posts_blocks_call_to_action" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."posts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."posts_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."site_settings" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."navigation_primary" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."navigation_utility" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."navigation" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."footer_link_groups_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."footer_link_groups" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."footer_legal_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."footer" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "payload"."media" CASCADE;
  DROP TABLE "payload"."documents" CASCADE;
  DROP TABLE "payload"."product_categories" CASCADE;
  DROP TABLE "payload"."products_highlights" CASCADE;
  DROP TABLE "payload"."products_specifications" CASCADE;
  DROP TABLE "payload"."products_variants" CASCADE;
  DROP TABLE "payload"."products" CASCADE;
  DROP TABLE "payload"."products_rels" CASCADE;
  DROP TABLE "payload"."pages_blocks_hero" CASCADE;
  DROP TABLE "payload"."pages_blocks_rich_text" CASCADE;
  DROP TABLE "payload"."pages_blocks_image_text" CASCADE;
  DROP TABLE "payload"."pages_blocks_card_grid_cards" CASCADE;
  DROP TABLE "payload"."pages_blocks_card_grid" CASCADE;
  DROP TABLE "payload"."pages_blocks_product_grid" CASCADE;
  DROP TABLE "payload"."pages_blocks_gallery" CASCADE;
  DROP TABLE "payload"."pages_blocks_downloads" CASCADE;
  DROP TABLE "payload"."pages_blocks_spec_table_rows" CASCADE;
  DROP TABLE "payload"."pages_blocks_spec_table" CASCADE;
  DROP TABLE "payload"."pages_blocks_call_to_action" CASCADE;
  DROP TABLE "payload"."pages_rels" CASCADE;
  DROP TABLE "payload"."posts_blocks_hero" CASCADE;
  DROP TABLE "payload"."posts_blocks_rich_text" CASCADE;
  DROP TABLE "payload"."posts_blocks_image_text" CASCADE;
  DROP TABLE "payload"."posts_blocks_card_grid_cards" CASCADE;
  DROP TABLE "payload"."posts_blocks_card_grid" CASCADE;
  DROP TABLE "payload"."posts_blocks_product_grid" CASCADE;
  DROP TABLE "payload"."posts_blocks_gallery" CASCADE;
  DROP TABLE "payload"."posts_blocks_downloads" CASCADE;
  DROP TABLE "payload"."posts_blocks_spec_table_rows" CASCADE;
  DROP TABLE "payload"."posts_blocks_spec_table" CASCADE;
  DROP TABLE "payload"."posts_blocks_call_to_action" CASCADE;
  DROP TABLE "payload"."posts" CASCADE;
  DROP TABLE "payload"."posts_rels" CASCADE;
  DROP TABLE "payload"."site_settings" CASCADE;
  DROP TABLE "payload"."navigation_primary" CASCADE;
  DROP TABLE "payload"."navigation_utility" CASCADE;
  DROP TABLE "payload"."navigation" CASCADE;
  DROP TABLE "payload"."footer_link_groups_links" CASCADE;
  DROP TABLE "payload"."footer_link_groups" CASCADE;
  DROP TABLE "payload"."footer_legal_links" CASCADE;
  DROP TABLE "payload"."footer" CASCADE;
  ALTER TABLE "payload"."pages" DROP CONSTRAINT IF EXISTS "pages_seo_image_id_media_id_fk";
  
  ALTER TABLE "payload"."payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_media_fk";
  
  ALTER TABLE "payload"."payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_documents_fk";
  
  ALTER TABLE "payload"."payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_product_categories_fk";
  
  ALTER TABLE "payload"."payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_products_fk";
  
  ALTER TABLE "payload"."payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_posts_fk";
  
  DROP INDEX "payload"."pages_status_idx";
  DROP INDEX "payload"."pages_seo_seo_image_idx";
  DROP INDEX "payload"."payload_locked_documents_rels_media_id_idx";
  DROP INDEX "payload"."payload_locked_documents_rels_documents_id_idx";
  DROP INDEX "payload"."payload_locked_documents_rels_product_categories_id_idx";
  DROP INDEX "payload"."payload_locked_documents_rels_products_id_idx";
  DROP INDEX "payload"."payload_locked_documents_rels_posts_id_idx";
  ALTER TABLE "payload"."console_users" ALTER COLUMN "role" SET DEFAULT 'editor';
  ALTER TABLE "payload"."pages" ADD COLUMN "hero_heading" varchar;
  ALTER TABLE "payload"."pages" ADD COLUMN "body" varchar;
  ALTER TABLE "payload"."pages" DROP COLUMN "summary";
  ALTER TABLE "payload"."pages" DROP COLUMN "seo_title";
  ALTER TABLE "payload"."pages" DROP COLUMN "seo_description";
  ALTER TABLE "payload"."pages" DROP COLUMN "seo_image_id";
  ALTER TABLE "payload"."payload_locked_documents_rels" DROP COLUMN "media_id";
  ALTER TABLE "payload"."payload_locked_documents_rels" DROP COLUMN "documents_id";
  ALTER TABLE "payload"."payload_locked_documents_rels" DROP COLUMN "product_categories_id";
  ALTER TABLE "payload"."payload_locked_documents_rels" DROP COLUMN "products_id";
  ALTER TABLE "payload"."payload_locked_documents_rels" DROP COLUMN "posts_id";
  DROP TYPE "payload"."enum_products_status";
  DROP TYPE "payload"."enum_products_template";
  DROP TYPE "payload"."enum_pages_blocks_image_text_image_side";
  DROP TYPE "payload"."enum_pages_blocks_product_grid_mode";
  DROP TYPE "payload"."enum_posts_blocks_image_text_image_side";
  DROP TYPE "payload"."enum_posts_blocks_product_grid_mode";
  DROP TYPE "payload"."enum_posts_status";`)
}
