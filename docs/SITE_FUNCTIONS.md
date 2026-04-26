# Site Functions

Concise living reference for how the current Eltronic Next.js site works.

## App Structure

- Framework: Next.js with App Router.
- Global layout: `src/app/layout.tsx`.
- Global styles: `src/app/globals.css`.
- Product seed data: `src/content/products.ts`.
- Managed data layer: `src/lib/managed-data.ts`.
- Admin UI: `src/app/studio`.
- Public navigation: brand link to `/`, plus `/products`, `/about`, and `/contact`.
- Fonts: `Tajawal` and `Fira_Code` are loaded through `next/font/google`.
- UI system: public pages use custom CSS; admin uses Tailwind CSS v4 and shadcn-style local components under `src/components/ui`.

## Current Routes

- `/`: homepage with hero copy, product-template explanation, and product cards generated from `products`.
- `/products`: dynamic product listing page generated from the managed catalogue.
- `/products/[slug]`: dynamic product detail page generated from the managed catalogue.
- `/about`: placeholder page for company story, services, credentials, and trust-building content.
- `/contact`: quote/contact flow that stores submissions in the managed data layer.
- `/studio/login`: password login for the admin area.
- `/studio`: shadcn-styled admin for products, template assignment and contact submissions.

## Product Data Model

Products are seeded from `src/content/products.ts` and read through `src/lib/managed-data.ts`. In local development, edits are written to `.data/eltronic-data.json`. In production, persistent writes require Upstash/Vercel KV environment variables.

Each product currently has:

- `slug`: URL segment used by `/products/[slug]`.
- `name`: display name.
- `category`: product category label.
- `family`: product family label.
- `template`: one of `hmi`, `data-logger`, or `module`.
- `sourceUrl`: original crawl/source URL.
- `image`: `{ src, alt }` used by listings and detail pages.
- `summary`: short card/listing copy.
- `description`: product detail intro copy.
- `highlights`: list of product or template highlights.
- `specifications`: list of `{ label, value }` rows shown on detail pages.
- `documents`: optional list of data sheet/document links.
- `variants`: optional order/variant list.
- `enquiryPrompt`: detail-page call-to-action label.

## Product Detail Behavior

- Product listing and detail pages are marked dynamic so admin changes can be reflected without rebuilding static slug lists.
- `generateMetadata()` sets product-specific page title and description.
- Unknown product slugs call `notFound()`.
- The detail page displays family, category, name, description, template-specific heading, image, highlights, enquiry prompt, specifications, documents and variants where available.
- Template headings are currently mapped in `src/app/products/[slug]/page.tsx`.

## Current Product Templates

- `hmi`: rugged HMI display products.
- `data-logger`: CAN/CAN-FD logging and diagnostics products.
- `module`: I/O module or expansion products.

## Admin Behavior

- `/studio` requires an admin session cookie.
- Temporary login is `admin` / `password`.
- Production can override this with `ELTRONIC_ADMIN_USERNAME`, `ELTRONIC_ADMIN_PASSWORD`, and `ELTRONIC_ADMIN_SECRET`.
- Product forms support newline-based editing for highlights, specs, documents and variants.
- Template assignment is managed with a select field on each product.
- Contact submissions can be reviewed, statused as `new`, `reviewed`, `replied`, or `archived`, and deleted.

## Storage Behavior

- Without KV, local development writes to `.data/eltronic-data.json`.
- `.data/` is gitignored because it may contain contact submissions.
- On Vercel, set `KV_REST_API_URL` and `KV_REST_API_TOKEN` to persist products and submissions.
- Without persistent production storage, public pages fall back to seeded product content and admin/contact writes are blocked.

## Deployment Behavior

- Vercel project: `project-5v5cr`.
- Vercel project metadata is stored locally in `.vercel/project.json`.
- `vercel.json` explicitly declares the framework as Next.js.
- Standard scripts are available through `package.json`: `npm run dev`, `npm run build`, `npm run start`, and `npm run lint`.

## Known Placeholders

- Product content is now seeded from the public `eltronic.co.uk` crawl.
- Product pages show real product copy, source trace links, public WordPress image URLs, specifications, documents where known, and order variants where available.
- WordPress migration/plugin work is being considered but is not implemented in the current app.
- Image upload management is not implemented yet; product images currently use URLs.
