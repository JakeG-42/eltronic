# Site Functions

Concise living reference for how the current Eltronic Next.js site works.

## App Structure

- Framework: Next.js with App Router.
- Global layout: `src/app/layout.tsx`.
- Public site shell: `src/app/(site)/layout.tsx` and `src/components/site/site-shell.tsx`.
- Public ambient background: `src/components/site/ambient-background.tsx` renders subtle floating syntax glyphs behind public pages.
- Public product media gallery: `src/components/site/product-media-gallery.tsx`.
- Homepage role typewriter: `src/components/site/hero-role-typewriter.tsx` animates the small role label above the `Eltronic` hero wordmark.
- Studio product image manager: `src/components/studio/product-image-manager.tsx`.
- Studio shell: `src/app/studio/(admin)/layout.tsx` and `src/components/studio/studio-shell.tsx`.
- Website Builder defaults: `src/content/site-builder.ts`.
- Template/file editor registry: `src/lib/template-editor.ts`.
- Classic/Woo-style Studio: `/studio/classic/products` uses `src/components/studio/classic/woocommerce-product-editor.tsx` and WordPress/WooCommerce-inspired list/edit screens.
- Global styles: `src/app/globals.css`.
- Product seed data: `src/content/products.ts`.
- Site page/module content: `src/content/site.ts`.
- Managed data layer: `src/lib/managed-data.ts`.
- Contact captcha helper: `src/lib/contact-captcha.ts`.
- Admin UI: `src/app/studio`.
- Public navigation: brand link to `/`, desktop icon-labelled links for `/products`, `/solutions`, `/software-it`, `/about`, and `/contact`, plus a compact hamburger menu on mobile. The mobile menu auto-closes on link click, outside tap and Escape. `Sectors` and `Data & specification` remain reachable from page CTAs and the footer.
- Fonts: `Tajawal` and `Fira_Code` are loaded through `next/font/google`.
- UI system: public pages use custom CSS; admin uses Tailwind CSS v4 and shadcn-style local components under `src/components/ui`.
- Technical visual modules: `src/components/site/technical-visuals.tsx` renders SVG-style imagery for public pages.
- Public footer: `src/components/site/site-shell.tsx` renders a simple static footer; avoid sticky/reveal footer effects unless they are tested across full-page layouts.
- AI context pack: future agents should start with `docs/AGENT_CONTEXT.md` and `docs/AI_FUNCTION_MAP.json`.
- Public content tone: prefer precise wording such as specialist equipment, operating environment, application, platform, control system and operational workflow instead of repeating generic machine/machinery phrasing.

## Current Routes

- `/`: homepage with hero copy, solution/service sections, featured product cards, public service CTAs and the shared professional workflow modules from `src/content/site.ts`.
- `/products`: dynamic product listing page generated from the managed catalogue.
- `/products/[slug]`: dynamic product detail page generated from the managed catalogue.
- `/solutions`: public solution/service page for HMI, CAN-Bus and bespoke control integration.
- `/software-it`: public service page for bespoke software, internal systems, API/shipping integrations, embedded services, servers and technical consultation.
- `/sectors`: public sector page for agriculture, construction, logistics and industrial automation.
- `/data-specification`: public resource page for data sheets, guides and product documents.
- `/about`: company positioning page for Eltronic's machinery, product, integration and software approach.
- `/contact`: quote/contact flow that stores submissions in the managed data layer.
- `/studio/login`: password login for the admin area.
- `/studio`: shadcn-styled admin dashboard.
- `/studio/builder`: protected Website Builder for homepage theme, hero, section visibility and section order.
- `/studio/templates`: protected WordPress-style source/template file viewer and local-development editor.
- `/studio/products`: product table with quick-edit drawer.
- `/studio/products/new`: product creation form.
- `/studio/products/[slug]/edit`: full product editor.
- `/studio/classic/products`: WordPress/WooCommerce-style product list table.
- `/studio/classic/products/new`: WordPress/WooCommerce-style add product editor.
- `/studio/classic/products/[slug]/edit`: WordPress/WooCommerce-style edit product editor.
- `/studio/submissions`: contact submission inbox.
- `/studio/settings`: Studio settings and notes.

## Product Data Model

Products are seeded from `src/content/products.ts` and read through `src/lib/managed-data.ts`. In local development, edits are written to `.data/eltronic-data.json`. In production, persistent writes require Neon/Postgres or Upstash/Vercel KV environment variables.

Each product currently has:

- `slug`: URL segment used by `/products/[slug]`.
- `name`: display name.
- `category`: product category label.
- `family`: product family label.
- `template`: one of `hmi`, `data-logger`, or `module`.
- `sourceUrl`: original crawl/source URL.
- `sku`: optional admin/internal stock keeping unit; not displayed publicly yet.
- `price`: optional admin/internal price or price note; not displayed publicly yet.
- `tags`: optional admin/product-management tags.
- `modules`: admin module switches for gallery, highlights, specifications, documents, variants and enquiry; stored but not wired into public rendering yet.
- `image`: `{ src, alt }` used by listings and detail pages.
- `images`: optional ordered gallery of `{ src, alt }`; public product galleries use these managed images only, with `image` as the fallback primary image. Seed products currently include three managed `IMAGES COMING SOON` placeholders so the gallery and Studio image manager have multiple images to work with.
- `summary`: short card/listing copy.
- `description`: product detail intro copy.
- `highlights`: list of product or template highlights.
- `specifications`: list of `{ label, value }` rows shown on detail pages.
- `documents`: optional list of data sheet/document links.
- `variants`: optional order/variant list with optional SKU, price and article number.
- `enquiryPrompt`: detail-page call-to-action label.

## Website Builder Behavior

- `/studio/builder` edits managed homepage settings through `saveSiteBuilderAction()` in `src/app/studio/actions.ts`.
- Defaults live in `src/content/site-builder.ts`; saved values live as `siteBuilder` in the managed data object handled by `src/lib/managed-data.ts`.
- The homepage reads `getSiteBuilderSettings()` and applies the settings dynamically.
- Builder controls currently include theme preset, accent/secondary/highlight colours, background style, visual density, hero brand/typewriter/lede/CTAs/visual, and homepage section visibility/order/copy.
- The builder is intentionally inside Studio only. There is no public WordPress-style admin toolbar when logged in.
- This is the first builder layer; deeper per-page and per-card editing can be added against the same `SiteBuilderSettings` model.

## Template/File Editor Behavior

- `/studio/templates` is a protected WordPress-style template/file editor.
- The editable/viewable file list is whitelisted in `src/lib/template-editor.ts`; it intentionally avoids `.env`, `.git`, `node_modules`, Vercel config, local data and arbitrary filesystem browsing.
- It can read public page templates, theme components, content modules, Studio templates and global CSS.
- Saving is only enabled in local development. On Vercel/production it is read-only because source edits made on a serverless deployment would not be safely versioned or survive normal redeploys.
- `next.config.ts` includes tracing entries for `/studio/templates` so the whitelisted `src` files can be inspected from production builds.

## Product Detail Behavior

- Product listing and detail pages are marked dynamic so admin changes can be reflected without rebuilding static slug lists.
- `generateMetadata()` sets product-specific page title and description.
- Unknown product slugs call `notFound()`.
- The detail page displays family, category, name, description, template-specific heading, image, highlights, enquiry prompt, specifications, documents and variants where available.
- Multiple product images render as an interactive ordered gallery on the detail page with selectable thumbnails, touch swipe/mobile gestures, desktop click-drag switching and a zoom overlay. The gallery only uses managed product media from seed data or Studio edits.
- Template headings are currently mapped in `src/app/(site)/products/[slug]/page.tsx`.

## Contact Anti-Spam Behavior

- The contact form includes a simple local maths captcha generated by `createMathCaptcha()` in `src/lib/contact-captcha.ts`.
- The captcha token is HMAC-signed and short-lived, so the submitted answer is verified server-side by `submitContactFormAction()` before a submission is stored.
- A hidden `website` honeypot field provides an extra low-friction bot signal.
- Captcha failures and honeypot hits are stored as blocked contact records when storage is available, with `type` values of `captcha_failed` or `honeypot_spam`.
- `/studio/submissions` has filters for Enquiries, Blocked, Captcha, Honeypot and All records.
- There are no third-party captcha scripts, cookies or external anti-spam services.
- `npm run test:contact-bot` runs a safe fake-bot tester against `https://project-5v5cr.vercel.app` by default. It only tests rejected bot paths unless `-- --valid` is passed.

## Current Product Templates

- `hmi`: rugged HMI display products.
- `data-logger`: CAN/CAN-FD logging and diagnostics products.
- `module`: I/O module or expansion products.

## Admin Behavior

- `/studio` requires an admin session cookie.
- Temporary login is `admin` / `password`.
- Production can override this with `ELTRONIC_ADMIN_USERNAME`, `ELTRONIC_ADMIN_PASSWORD`, and `ELTRONIC_ADMIN_SECRET`.
- Auth is implemented in `src/lib/admin-auth.ts` with HMAC-signed credential comparisons and a signed 7-day `eltronic_admin_session` cookie.
- Studio is separate from the public site shell; public header/footer do not render in admin routes.
- Studio has a sidebar, dashboard, products, enquiries and settings modes.
- Studio includes a Website Builder mode for homepage theme/content controls.
- Studio includes a Template Editor mode for inspecting whitelisted source files.
- Studio has browser-local dark/light mode stored in `localStorage`.
- Studio page titles are intentionally compact: the sticky top bar carries the current mode, while page bodies use small action/description rows instead of large duplicate headings.
- Existing Studio topbar includes `Switch to new`, which opens the WordPress/WooCommerce-style product backend at `/studio/classic/products`. That backend includes a black admin bar, left admin menu, product list table, Screen Options/Help tabs, product data panels, publish box, category/tag boxes and product image/gallery boxes. The classic UI is a functional approximation mapped to the current Eltronic product schema, not a full WordPress/WooCommerce runtime.
- Product management is table-first with full edit pages and a quick-edit right drawer.
- Product forms use a WooCommerce-style two-column editor: main content sections on the left, with a sticky publish/commerce/module sidebar on desktop. Sections remain collapsible so image, technical, module and variant panels can be shown/hidden while editing.
- Product forms support newline-based editing for highlights, specs, documents and variants.
- Product management includes admin-only SKU, price, tags and module enable/disable settings.
- Product image editing uses a visual preview/order manager with repeated `imageSrc` and `imageAlt` fields. The first image is saved as the primary image.
- Template assignment is managed with a select field on each product.
- Contact submissions can be reviewed, statused as `new`, `reviewed`, `replied`, `archived`, or `blocked`, filtered by type, and deleted.

## Storage Behavior

- Without persistent storage, local development writes to `.data/eltronic-data.json`.
- `.data/` is gitignored because it may contain contact submissions.
- On Vercel, use Neon/Postgres `DATABASE_URL`, integration-prefixed `eltronic_db_1_DATABASE_URL`, or Redis `KV_REST_API_URL` and `KV_REST_API_TOKEN` to persist products and submissions.
- Without persistent production storage, public pages fall back to seeded product content and admin/contact writes are blocked.
- As of 2026-04-27, Neon database `eltronic_db_1` is connected to Vercel with prefixed environment variables, storage smoke tests pass, and production deployment `dpl_DfWPHsfjnjTYoAuB8zkHqFRzni2j` is live.
- Use `npm run storage:check` after `npx vercel env pull .env.local` to confirm the live database credentials work before trusting admin/product/submission writes.

## Deployment Behavior

- Vercel project: `project-5v5cr`.
- Vercel project metadata is stored locally in `.vercel/project.json`.
- `vercel.json` explicitly declares the framework as Next.js.
- Standard scripts are available through `package.json`: `npm run dev`, `npm run build`, `npm run start`, and `npm run lint`.

## Known Placeholders

- Product content is now seeded from the public `eltronic.co.uk` crawl.
- Product pages show product copy, local product image assets, specifications, documents where known, and order variants where available.
- WordPress migration/plugin work is being considered but is not implemented in the current app.
- Image upload management is not implemented yet; product images currently use URLs.
- Generated public-page imagery is currently code-native SVG, not bitmap media uploads.
- Product galleries do not append hidden fallback images; any placeholders should be explicit seed/Studio image entries so they are visible in the admin image manager.
