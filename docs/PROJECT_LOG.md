# Project Log

Concise living log for the Eltronic standalone site/app. Add newest updates at the top.

## Current Status

- Repository: standalone GitHub repo `JakeG-42/eltronic`.
- Active branch: `main`.
- App scaffold: Next.js app using the App Router under `src/app`.
- Deployment: Vercel project `project-5v5cr` is connected and deployed.
- Vercel config: `vercel.json` sets `"framework": "nextjs"` to keep framework detection explicit.
- Product content: initial structured product data lives in `src/content/products.ts`; live editable data is read through `src/lib/managed-data.ts`.
- Admin: `/studio` is a password-protected shadcn/Tailwind admin for products, templates and contact submissions.
- Contact handling: `/contact` now stores enquiries through the managed data layer.

## What Has Happened So Far

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
- Added local JSON development storage with optional Upstash/Vercel KV persistence through `KV_REST_API_URL` and `KV_REST_API_TOKEN`.
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
- Upgraded Studio product management with collapsible WooCommerce-style sections plus admin-only SKU, price, tags, enhanced variants and product module switches.
- Added mobile hamburger auto-close behavior for link clicks, outside taps and Escape.
- Added swipe/drag switching to product galleries and reshaped the Studio product editor into a main column plus sticky management sidebar.
- Refined public content tone away from repeated machine/machinery phrasing, reduced oversized public headings and added restrained magenta/purple halogen edge accents to selected cards.
- Replaced large duplicate Studio page titles with compact action rows, shortened the About hero heading, tightened homepage hero spacing and added a role typewriter above the Eltronic wordmark.
- Reduced the oversized About page approach quote card so it reads as supporting content instead of a dominant headline.
- Added a protected WordPress/WooCommerce-style product backend under `/studio/classic/products`, plus a `Switch to new` button from the current Studio and `Switch to current` from the classic shell.
- Checked Vercel env vars on 2026-04-27; none are configured yet, so KV/Upstash persistence is still required before live admin/contact writes are trusted.

## Future Considerations

- WordPress migration work is being considered for any content that is not publicly crawlable.
- A possible temporary WordPress plugin could provide a controlled JSON/ZIP export from wp-admin.
- Production persistence needs a Vercel KV/Upstash Redis connection before live admin writes and contact submissions should be trusted.
- Future admin improvements could include image uploads, richer product template fields, and email notifications for new submissions.
- Keep AI-facing docs current when auth, route, storage or product-template behavior changes.

## Update Notes

- Keep entries factual and brief.
- Prefer linking to code paths when a behavior changes.
- Record deployment/config changes when they affect how the site is built or hosted.
