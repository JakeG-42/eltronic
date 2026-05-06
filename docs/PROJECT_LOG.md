# Project Log

Concise living log for the Eltronic standalone site/app. Add newest updates at the top.

## Current Status

- Repository: standalone GitHub repo `JakeG-42/eltronic`.
- Active branch: `main` for current production work.
- App scaffold: Next.js app using the App Router under `src/app`.
- Deployment: Vercel project `project-5v5cr` is connected and deployed.
- Vercel config: `vercel.json` sets `"framework": "nextjs"` to keep framework detection explicit.
- Product content: initial structured product data lives in `src/content/products.ts`; live editable data is read through `src/lib/managed-data.ts`.
- Topcon catalogue source: `docs/topcon_product_catalogue_import.csv` and `src/content/topcon-products.json`; sync to Neon with `npm run products:topcon:sync`.
- Admin: `/studio` is a password-protected shadcn/Tailwind admin for products, tools, Code Studio and contact submissions.
- Contact handling: `/contact` now stores enquiries through the managed data layer.
- SEO: sitemap, robots rules, canonical metadata, structured data and project/case-study scaffolding are in place.

## What Has Happened So Far

- Collapsed product templates to a single `default` template, normalizing legacy `hmi`, `data-logger` and `module` records on read, and moved product technical data into a full-width section under highlights.
- Reworked `/studio/media` into a compact selectable media manager with seven-column desktop grid, table view and bulk removal of selected product-gallery image references.
- Renamed the Studio sidebar Templates item to Code Studio and moved it into the Admin group.
- Restyled Studio `product.media` editing from row-based image cards into a compact gallery grid with a dedicated add-image tile and a modal editor for URL, upload, filename and alt text.
- Added `/studio/media` under the Content sidebar group to review product gallery media, and changed uploaded product image rows to display normalized filenames instead of raw inline `data:image/...` payloads.
- Added per-row Studio product image uploads beside the URL field. Uploaded images are resized in the browser, stored as inline managed image data, and rendered through a shared managed-image component that supports both URLs and inline uploads.
- Made product galleries explicitly open-ended across templates by changing the public thumbnail strip to horizontal scrolling, replacing the stale fixed-slot Studio summary, and posting ordered `galleryImagesJson` from the image manager so dynamically added rows persist reliably.
- Added a protected Studio Tools section with `/studio/tools/qr-code`, a client-side QR code generator for links/text and Wi-Fi network join codes. It supports square, rounded and circular dots, foreground/background colours, centre logo upload, and PNG/SVG export.
- Removed the separate Console CMS and `/v2` new-site sandbox for now, including the CMS route groups, builder code, generated types, migrations, related dependencies and `new.eltronic.co.uk` rewrite. Current work is focused on the public site and `/studio`.
- Removed the WordPress/WooCommerce-style classic Studio backend under `/studio/classic`, including its product routes, shell switcher, editor component and dedicated CSS. Product management now stays on the current Studio product table, quick-edit drawer and full editor.
- Replaced the stale 9-product Topcon seed/catalogue with 14 CSV-sourced Topcon OPUS products, including real Topcon image URLs, datasheets, operating manuals, highlights and technical data. Added `npm run products:topcon:sync` to replace Topcon records in Neon while preserving non-Topcon products and writing a local backup.
- Crawled the public `eltronic.co.uk` site for product, contact, homepage and guide/data-sheet content.
- Ported the first real product catalogue into `src/content/products.ts`.
- Started adapting the UI toward the dark code-inspired direction provided by Jake, while keeping it product-led rather than portfolio/CV-led.
- Eltronic was moved into its own standalone GitHub repository at `JakeG-42/eltronic`.
- The local repo is tracking the standalone GitHub remote on `main`.
- A Next.js scaffold was created with public routes, shared layout, global styles, and structured product content.
- Vercel was connected to the project as `project-5v5cr`.
- Deployment is active through Vercel.
- A Vercel framework detection issue was addressed with `vercel.json`.
- Initial product-template support was added through a `template` field in the product data model.
- Added Tailwind CSS v4 and local shadcn-style UI primitives for the admin interface.
- Added simple admin authentication using `ELTRONIC_ADMIN_PASSWORD` and `ELTRONIC_ADMIN_SECRET`.
- Added local JSON development storage with optional Neon/Postgres persistence through `DATABASE_URL`/prefixed Vercel integration variables, plus fallback Upstash/Vercel KV persistence through `KV_REST_API_URL` and `KV_REST_API_TOKEN`.
- Switched public product routes to read from managed catalogue data so admin edits can feed the front end.
- Added an AI context pack in `docs/AGENT_CONTEXT.md` and `docs/AI_FUNCTION_MAP.json` so future sessions can quickly recover auth, storage, routes and feature behavior.
- Split public site chrome from Studio chrome with route groups.
- Added Studio sidebar modes, dark/light mode, product table, quick-edit drawer, full product edit pages and ordered multi-image product galleries.
- Added public `Solutions`, `Sectors`, and `Data & Specification` pages with reusable code-native technical visual modules.
- Added public nav icons and product detail spacing polish.
- Replaced static product image cards with an interactive thumbnail gallery and zoom overlay, and tightened public nav icon alignment.
- Moved public catalogue imagery into local `public/product-images` assets and removed public-facing migration/source-trace language.
- Redesigned the public contact page with a dedicated enquiry layout and responsive form panel.
- Added `/software-it` to present custom software, internal systems, API/shipping integration, embedded services, servers and consultation without bloating the main solutions page.
- Refined public workflow copy to present complex delivery as professionally controlled and easy for customers to follow.
- Reworked Studio product image editing into a visual preview/order manager and added outcome-led workflow cards with subtle active states.
- Removed the sticky footer reveal experiment and returned the public footer to a clean static section.
- Replaced the mobile public navigation with a compact hamburger menu, made the footer transparent/static again, and removed generated product-gallery placeholders so galleries rely on managed product images.
- Kept product cards in a two-column grid on mobile and added explicit managed `IMAGES COMING SOON` placeholder images to seed product galleries.
- Restored the public grid background by keeping the site shell transparent instead of covering the body background.
- Reworked the About page into a stronger company positioning page and simplified primary navigation to the main customer journeys.
- Added and tuned a subtle public ambient background with floating syntax glyphs and no cursor glow.
- Upgraded Studio product management with collapsible sections plus admin-only SKU, price, tags, enhanced variants and product module switches.
- Added mobile hamburger auto-close behavior for link clicks, outside taps and Escape.
- Added swipe/drag switching to product galleries and reshaped the Studio product editor into a main column plus sticky management sidebar.
- Refined public content tone away from repeated machine/machinery phrasing, reduced oversized public headings and added restrained magenta/purple halogen edge accents to selected cards.
- Replaced large duplicate Studio page titles with compact action rows, shortened the About hero heading, tightened homepage hero spacing and added a role typewriter above the Eltronic wordmark.
- Reduced the oversized About page approach quote card so it reads as supporting content instead of a dominant headline.
- Previously added a protected WordPress/WooCommerce-style product backend under `/studio/classic/products`, then removed it to reduce Studio clutter.
- Added `/studio/builder`, a protected Website Builder for homepage theme, hero content, section visibility and section ordering, backed by the managed data layer.
- Added `/studio/templates`, a protected template/file editor with a whitelisted source file tree and local-development-only save support.
- Added a local anti-spam layer to the contact form with a signed maths captcha and hidden honeypot field.
- Updated contact anti-spam to capture blocked captcha and honeypot attempts in the Studio submissions inbox with type filters.
- Added duplicate suppression for blocked contact attempts and colour-coded Studio submission markers for enquiries, captcha failures and honeypot spam.
- Added Resend-backed contact email notifications for both enquiries and blocked attempts, with Studio frequency settings and a Vercel Cron digest endpoint.
- Added the Resend API key and temporary sender to Vercel; delivery to `jakub@gajosz.com` is pending Resend domain verification and a domain-based sender address.
- Switched email delivery from raw fetch to the official `resend` package and added an onboarding test mode for Resend's first-email sample.
- Confirmed the Resend onboarding test delivered to `jakubgajosz1999@gmail.com`, though it landed in spam. Before launch, verify the Eltronic domain in Resend and update the sender to an Eltronic-domain address.
- Fixed live contact notification delivery during the temporary Resend setup by switching Vercel `CONTACT_NOTIFICATION_TO` and the persisted Studio notification recipient to `jakubgajosz1999@gmail.com`; a configured email test and a live enquiry submission test passed.
- Polished Studio email settings so admins can clearly set comma-separated notification recipients, see saved/error feedback and get validation for mistyped email addresses.
- Added a brutal direct SMTP notification transport behind `CONTACT_NOTIFICATION_TRANSPORT=direct` for testing owner notifications from Vercel without Resend; keep Resend available as the safer/default transport.
- Switched Vercel production/development email notifications to direct SMTP mode using `Eltronic <notifications@eltronic.co.uk>` and `eltronic.co.uk` HELO; a live contact test reached `sent=1` and produced no immediate Vercel warning.
- Paused email notifications after the direct SMTP test failed in practice: removed direct SMTP sender env vars from Vercel and set Studio notification mode to `off` while keeping submissions stored in Neon.
- Reworked public Software & Systems copy to better reflect full-stack, embedded, IoT/device, API and operational systems capability without sounding like generic IT support; updated persisted homepage builder copy in Neon to match.
- Added `npm run storage:check` to verify Neon/Postgres or Upstash/Vercel Redis credentials by writing, reading and deleting a short-lived test key before trusting live admin/contact persistence.
- Connected Neon database `eltronic_db_1` on Vercel; the app supports the prefixed env vars injected by the integration.
- Deployed Neon-backed storage support to production deployment `dpl_DfWPHsfjnjTYoAuB8zkHqFRzni2j`; `npm run storage:check` passes and the safe contact bot tester saved two blocked records in Neon.
- Added SEO foundations: shared metadata helpers, dynamic `/sitemap.xml`, `/robots.txt`, favicon/manifest, Open Graph image, public page canonical metadata, noindex Studio metadata and structured data for products/projects.
- Added `/projects` and `/projects/[slug]` case-study scaffolding plus `docs/PROJECT_CASE_STUDY_TEMPLATE.md` so future project write-ups with photos can be added cleanly.
- Created local offline backups in `/Users/jake/Documents/Eltronic_backups` and branched `dev` from `main` for launch-hardening work.
- Added managed Studio users with `super_admin`, `admin` and `moderator` roles, hashed passwords, session-version invalidation, `/studio/users` and `/studio/account`.
- Cleaned launch-facing content issues: removed public Studio footer link, filtered placeholder gallery images from public output, tightened I&Q CAN-Bus module copy, softened empty Projects/Data/Contact copy and added `docs/LAUNCH_CHECKLIST.md`.
- Added repeatable generated product gallery assets: 33 technical SVG illustrations across 11 products, a `src/content/product-gallery-assets.json` manifest, `npm run images:products`, and `npm run images:products:sync` to sync the gallery paths into Neon managed product records.
- Added Studio submission bulk actions, auto-refresh, an authenticated submission summary API and coloured sidebar `+N` enquiry badges; also grouped and reduced the Studio sidebar navigation.
- Previously trialled a separate Console CMS and new-site sandbox, then removed it before continuing professional-site work on the current public site and `/studio`.

## Future Considerations

- Legacy-site migration work can be considered for any content that is not publicly crawlable.
- Production persistence needs a passing `npm run storage:check` and a fresh Vercel deployment before live admin writes and contact submissions should be trusted.
- Future admin improvements could include image uploads, per-page builder screens, richer product template fields, and richer email delivery logs.
- Future SEO/content work should add real project case studies, original project photos, final-domain `NEXT_PUBLIC_SITE_URL`, Search Console submission and domain-specific Open Graph preview checks.
- Replace generated product technical illustrations with real additional product/application photography when available, or keep them as controlled supporting diagrams where photography is missing.
- Keep AI-facing docs current when auth, route, storage or product-template behavior changes.

## Update Notes

- Keep entries factual and brief.
- Prefer linking to code paths when a behavior changes.
- Record deployment/config changes when they affect how the site is built or hosted.
