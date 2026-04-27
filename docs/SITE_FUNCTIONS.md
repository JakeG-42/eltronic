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
- Global styles: `src/app/globals.css`.
- Product seed data: `src/content/products.ts`.
- Site page/module content: `src/content/site.ts`.
- Managed data layer: `src/lib/managed-data.ts`.
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
- `/solutions`: public solution/service page for HMI, CANbus and bespoke control integration.
- `/software-it`: public service page for bespoke software, internal systems, API/shipping integrations, embedded services, servers and technical consultation.
- `/sectors`: public sector page for agriculture, construction, logistics and industrial automation.
- `/data-specification`: public resource page for data sheets, guides and product documents.
- `/about`: company positioning page for Eltronic's machinery, product, integration and software approach.
- `/contact`: quote/contact flow that stores submissions in the managed data layer.
- `/studio/login`: password login for the admin area.
- `/studio`: shadcn-styled admin dashboard.
- `/studio/products`: product table with quick-edit drawer.
- `/studio/products/new`: product creation form.
- `/studio/products/[slug]/edit`: full product editor.
- `/studio/submissions`: contact submission inbox.
- `/studio/settings`: Studio settings and notes.

## Product Data Model

Products are seeded from `src/content/products.ts` and read through `src/lib/managed-data.ts`. In local development, edits are written to `.data/eltronic-data.json`. In production, persistent writes require Upstash/Vercel KV environment variables.

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

## Product Detail Behavior

- Product listing and detail pages are marked dynamic so admin changes can be reflected without rebuilding static slug lists.
- `generateMetadata()` sets product-specific page title and description.
- Unknown product slugs call `notFound()`.
- The detail page displays family, category, name, description, template-specific heading, image, highlights, enquiry prompt, specifications, documents and variants where available.
- Multiple product images render as an interactive ordered gallery on the detail page with selectable thumbnails, touch swipe/mobile gestures, desktop click-drag switching and a zoom overlay. The gallery only uses managed product media from seed data or Studio edits.
- Template headings are currently mapped in `src/app/(site)/products/[slug]/page.tsx`.

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
- Studio has browser-local dark/light mode stored in `localStorage`.
- Studio page titles are intentionally compact: the sticky top bar carries the current mode, while page bodies use small action/description rows instead of large duplicate headings.
- Product management is table-first with full edit pages and a quick-edit right drawer.
- Product forms use a WooCommerce-style two-column editor: main content sections on the left, with a sticky publish/commerce/module sidebar on desktop. Sections remain collapsible so image, technical, module and variant panels can be shown/hidden while editing.
- Product forms support newline-based editing for highlights, specs, documents and variants.
- Product management includes admin-only SKU, price, tags and module enable/disable settings.
- Product image editing uses a visual preview/order manager with repeated `imageSrc` and `imageAlt` fields. The first image is saved as the primary image.
- Template assignment is managed with a select field on each product.
- Contact submissions can be reviewed, statused as `new`, `reviewed`, `replied`, or `archived`, and deleted.

## Storage Behavior

- Without KV, local development writes to `.data/eltronic-data.json`.
- `.data/` is gitignored because it may contain contact submissions.
- On Vercel, set `KV_REST_API_URL` and `KV_REST_API_TOKEN` to persist products and submissions.
- Without persistent production storage, public pages fall back to seeded product content and admin/contact writes are blocked.
- As of 2026-04-27, `npx vercel env ls` showed no configured environment variables for `project-5v5cr`.

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
