# Agent Context

Read this first when returning to the Eltronic project. This document is written for future AI/code agents, but should stay understandable enough for Jake to audit.

## Purpose

Eltronic is a standalone Next.js replacement for the old WordPress/WooCommerce/Colibri site. It is quote/contact-led, not checkout-led. The admin area is a lightweight custom studio for managing products, assigning product templates and reading contact submissions.

Always verify current code before changing behavior. Treat this document as a map, not a substitute for inspecting files.

## Current Public URLs

- Production site: `https://project-5v5cr.vercel.app`
- Admin portal: `https://project-5v5cr.vercel.app/studio`
- Vercel project: `project-5v5cr`
- GitHub repo: `JakeG-42/eltronic`

## First Files To Inspect

- `src/lib/admin-auth.ts`: admin credential and cookie session logic.
- `src/lib/managed-data.ts`: product/submission storage abstraction.
- `src/app/studio/(admin)/layout.tsx`: protected Studio shell wrapper.
- `src/app/studio/(admin)/page.tsx`: Studio dashboard.
- `src/app/studio/(admin)/products/page.tsx`: product table and quick-edit drawer.
- `src/app/studio/(admin)/products/[slug]/edit/page.tsx`: full product editor.
- `src/app/studio/actions.ts`: admin server actions.
- `src/app/contact/actions.ts`: public contact form submission action.
- `src/content/products.ts`: seed catalogue wrapper for Eltronic/AutoPi products plus imported Topcon data.
- `src/content/topcon-products.json`: CSV-backed Topcon OPUS catalogue records with real image and document URLs.
- `src/content/product-gallery-assets.json`: generated supplemental gallery assets for non-Topcon seed products.
- `src/content/site.ts`: public services, software/IT, sector, workflow and resource module content.
- `src/content/site-builder.ts`: Website Builder defaults for homepage theme, hero and section controls.
- `src/content/projects.ts`: public project/case-study content scaffold.
- `src/lib/seo.ts`: shared site URL, metadata and JSON-LD helpers.
- `src/app/sitemap.ts`: dynamic sitemap for public static routes, products and published projects.
- `src/app/robots.ts`: crawler policy for public pages versus Studio/API routes.
- `src/lib/template-editor.ts`: whitelisted Studio Template Editor file registry/read-write helpers.
- `src/lib/contact-captcha.ts`: local signed maths captcha for contact anti-spam.
- `src/components/site/technical-visuals.tsx`: code-native public-page technical visuals.
- `src/components/site/ambient-background.tsx`: subtle public-only floating syntax glyphs.
- `src/components/site/product-media-gallery.tsx`: interactive product image selection and zoom.
- `src/components/studio/product-image-manager.tsx`: Studio visual image preview/order editor.
- `public/product-images`: local product image assets used by the public catalogue.
- `public/product-images/generated`: generated technical product gallery illustrations.
- `public/product-images/placeholders`: legacy placeholder assets filtered out of public product galleries.
- `scripts/generate-product-gallery-assets.mjs`: repeatable generator/sync script for supplemental product gallery SVGs.
- `scripts/sync-topcon-products.mjs`: replaces managed Topcon products in Neon/Redis/local data from `src/content/topcon-products.json`.
- `docs/AI_FUNCTION_MAP.json`: machine-readable feature map.
- `docs/PROJECT_CASE_STUDY_TEMPLATE.md`: checklist and object shape for future project write-ups.
- `docs/LAUNCH_CHECKLIST.md`: pre-domain public launch checklist and manual media/content tasks.

## Auth Model

Auth now uses managed Studio users with roles, stored in the existing managed data JSON/Neon record.

- Login page: `src/app/studio/login/page.tsx`.
- Login action: `src/app/studio/login/actions.ts`.
- Auth utility: `src/lib/admin-auth.ts`.
- User model and password hashing: `src/lib/admin-user-model.ts`.
- Studio guard: `src/app/studio/(admin)/layout.tsx` calls `getCurrentAdminUser()`.
- Admin mutations: `src/app/studio/actions.ts` calls `requireAdminAction()` before writes.
- User management page: `src/app/studio/(admin)/users/page.tsx`.
- Own-account page: `src/app/studio/(admin)/account/page.tsx`.

### Credential Sources

Studio users are stored under `adminUsers` in `src/lib/managed-data.ts`. The first normalized data read seeds two super-admin users:

- Bootstrap `admin` user with the temporary legacy password.
- Jake's permanent super-admin email account.

Only salted `scrypt` password hashes are stored in source/data. Do not add plaintext passwords to docs or code. Keep `ELTRONIC_ADMIN_SECRET`, `AUTH_SECRET`, or `NEXTAUTH_SECRET` strong because it signs session cookies.

### Verification Flow

`verifyAdminCredentials(identifier, password)` looks up an active managed user by username or email.

- Passwords are verified with salted `scrypt` hashes and `timingSafeEqual`.
- Roles are `super_admin`, `admin`, and `moderator`.
- Super admin and admin currently have full control, including user resets.
- Moderator can access enquiries/moderation and their own account.

### Session Cookie

Successful login calls `setAdminSession()`.

- Cookie name: `eltronic_admin_session`.
- Cookie value shape: `<userId>.<sessionVersion>.<issuedAt>.<signature>`.
- Signature: HMAC-SHA256 of `userId.sessionVersion.issuedAt`.
- Max age: 7 days.
- Flags: `HttpOnly`, `SameSite=Lax`, `Secure` in production.
- Validation: `getCurrentAdminUser()` checks cookie presence, expiry, signature, active status and matching user `sessionVersion`.
- Password changes or admin resets bump `sessionVersion`, invalidating old sessions for that user.

### Launch Note

Keep the bootstrap `admin` account until Jake has tested the permanent super-admin account, then delete it manually from `/studio/users`.

## Managed Data Model

The managed data layer is in `src/lib/managed-data.ts`.

Storage selection:

- If `DATABASE_URL`, `POSTGRES_URL`, or a Vercel integration-prefixed variant such as `eltronic_db_1_DATABASE_URL` exists, use Neon/Postgres through `@neondatabase/serverless`.
- If `KV_REST_API_URL` and `KV_REST_API_TOKEN` exist, use Upstash/Vercel KV through `@upstash/redis`.
- If persistent storage is not configured and writes are allowed locally, use `.data/eltronic-data.json`.
- In production without persistent storage, use seeded products as read-only fallback and block writes.
- After pulling Vercel env vars locally, run `npm run storage:check` to verify Neon/Postgres or Redis can write, read and delete a test key.

The `.data/` folder is gitignored because it can contain contact submissions and edited content.

Managed data also stores Studio users under `adminUsers`; this means Neon/JSON persistence is required for user changes to survive deployment.

## Removed Console Experiment

The separate Console CMS and `/v2` new-site experiment have been removed from the app. The production surface is the current public site plus Eltronic Studio.

- Removed routes: `/console`, `/console-api`, `/v2`.
- Removed host rewrite: `new.eltronic.co.uk` no longer rewrites into this application.
- Removed code: `payload.config.ts`, `src/app/(payload)`, `src/app/(new-site)`, `src/payload`, `src/migrations`, `src/payload-types.ts`, `src/components/payload`, and the Console code-workspace API.
- Removed packages: Payload CMS packages and Puck.
- Do not reintroduce a second CMS or builder unless Jake explicitly asks for it. Continue improving the current public site and `/studio` first.

## Studio Layout

Studio is intentionally separate from the public site chrome.

- Public pages live under the `(site)` route group and use `src/components/site/site-shell.tsx`.
- Studio pages live under `src/app/studio/(admin)` and use `src/components/studio/studio-shell.tsx`.
- `/studio/login` is outside the protected admin route group.
- Studio navigation modes are real routes: `/studio`, `/studio/products`, `/studio/submissions`, `/studio/users`, `/studio/account`, and `/studio/settings`.
- The current Studio sidebar groups links under Overview, Content, Messages and Admin. Keep nav labels compact; the sidebar intentionally uses smaller text than the public site.
- The Enquiries nav item uses `src/components/studio/studio-submission-notifier.tsx` and `/api/studio/submissions/summary` to poll for new submission counts and show coloured `+N` badges by type.
- Studio theme is browser-local and toggled by `src/components/studio/studio-shell.tsx`.

## Product Management

Public catalogue pages read through `getProducts()` and `getProductBySlug()` from `src/lib/managed-data.ts`.

Admin product edits are handled by `saveProductAction()` in `src/app/studio/actions.ts`.

Topcon product data is sourced from `docs/topcon_product_catalogue_import.csv` and normalized into `src/content/topcon-products.json`. The current import contains 14 Topcon OPUS products with manufacturer-hosted front/rear/banner image URLs, datasheets, operating manuals, highlights and selected technical specs. Run `npm run products:topcon:sync -- --dry-run` before applying, then `npm run products:topcon:sync` to replace managed Topcon records while preserving AutoPi, Eltronic and the rest of the managed data. The sync writes a backup under `.data/backups/`.

Product gallery editing in Studio uses `src/components/studio/product-image-manager.tsx`, which posts ordered repeated `imageSrc` and `imageAlt` fields. Product galleries should be managed through seed data, Studio image fields or the generated-gallery manifest only. `productFromFormData()` in `src/lib/managed-data.ts` keeps backward compatibility with legacy newline `images` form data, but the UI should stay visual rather than returning to textarea-based image ordering.

Supplemental launch gallery images for AutoPi and the Eltronic I&Q module are generated by `npm run images:products`.

- The generator writes SVG assets to `public/product-images/generated`.
- The generator writes the manifest to `src/content/product-gallery-assets.json`.
- `src/content/products.ts` merges the manifest into seed product galleries.
- `npm run images:products:sync` also syncs those generated image paths into existing managed product records in Neon/Redis/local data.
- These generated assets are technical illustrations, not manufacturer photos. Topcon uses the real manufacturer image URLs from the CSV-backed catalogue data.

Website Builder settings are stored in `src/lib/managed-data.ts` under `siteBuilder`. Defaults are in `src/content/site-builder.ts`. `/studio/builder` saves through `saveSiteBuilderAction()` and the homepage uses `getSiteBuilderSettings()` to render theme variables, hero copy, section visibility and section order. Treat it as the internal Elementor/Colibri-style builder foundation; do not add a public admin toolbar unless Jake explicitly asks for one.

The Template Editor lives at `/studio/templates`. It reads a whitelist from `src/lib/template-editor.ts`. Keep it whitelisted. Do not turn it into arbitrary filesystem access. Saving is local-development-only; production/Vercel should remain read-only so source changes stay versioned through GitHub.

Admin product UI:

- `/studio/products`: table view.
- `/studio/products?quick=<slug>`: table view with right-side quick-edit drawer.
- `/studio/products/new`: new product page.
- `/studio/products/[slug]/edit`: full edit page.
- Shared form component: `src/components/studio/product-form.tsx`.

Product form parsing uses `productFromFormData()`:

- Core admin fields: `sku`, `price`, comma-separated `tags`, and `enabledModules` checkboxes are saved into the product record but are not displayed publicly yet.
- Images: visual Studio manager posts repeated `imageSrc` and `imageAlt` fields.
- Image order: component state/order controls public gallery order; the first image becomes the primary product image.
- Highlights: one item per line.
- Specifications: `Label | Value` per line.
- Documents: `Label | URL` per line.
- Variants: preferred format is `Name | SKU | Price | Details | Article number` per line. Legacy `Name | Details | Article number` rows are still accepted.

The Studio product form uses a two-column editing flow: main product sections on the left, with publish, commerce and module controls in a sticky sidebar on desktop. Keep sections collapsible when adding new product-management panels so the form remains manageable in the quick-edit drawer.

Product templates are currently:

- `hmi`
- `data-logger`
- `module`

Gallery behavior:

- `getProductImages(product)` returns managed media only: ordered `product.images` first, or the primary `product.image` if no gallery images are set.
- Generated technical gallery assets are explicit seed/managed `product.images` entries, not hidden runtime fallbacks.
- Placeholder gallery assets are filtered from public output.
- If a product needs replacement images, add them through Studio or seed data so the admin UI remains the source of truth.
- Product detail pages render `ProductMediaGallery`, a client component with thumbnail switching, keyboard-friendly zoom, and previous/next controls.
- Primary product images can be local files under `public/product-images` or trusted manufacturer URLs recorded in seed/managed data. Avoid legacy placeholder media in public galleries.

If adding a new template, update:

- `ProductTemplate` in `src/content/products.ts`.
- `parseProductTemplate()` in `src/lib/managed-data.ts`.
- The template select in `src/components/studio/product-form.tsx`.
- `productTypeLabel` in `src/app/(site)/products/[slug]/page.tsx`.
- `docs/AI_FUNCTION_MAP.json`.

## SEO And Project Pages

SEO foundations are centralised, not scattered.

- Site config and canonical URL helper: `src/lib/seo.ts`.
- Root metadata, title template, keywords, Open Graph/Twitter defaults and Organisation/WebSite JSON-LD: `src/app/layout.tsx`.
- Dynamic sitemap: `src/app/sitemap.ts`.
- Robots policy: `src/app/robots.ts`.
- Default social preview: `src/app/opengraph-image.tsx`.
- Favicon/app manifest: `src/app/icon.svg` and `src/app/manifest.ts`.
- Studio noindex metadata: `src/app/studio/(admin)/layout.tsx` and `src/app/studio/login/page.tsx`.

When the final Eltronic domain is connected, set `NEXT_PUBLIC_SITE_URL` in Vercel to the canonical production domain, for example `https://eltronic.co.uk`. That value feeds canonical links, structured data and sitemap URLs.

Project/case-study pages are prepared in `src/content/projects.ts`.

- Keep new entries `published: false` until the copy/photos are ready.
- `published: true` adds the project to `/projects`, generates `/projects/[slug]` and includes it in `/sitemap.xml`.
- Use local images under `public/projects/<slug>/...` where possible.
- Follow `docs/PROJECT_CASE_STUDY_TEMPLATE.md` for required fields and writing rules.
- Project detail pages emit article and breadcrumb JSON-LD.

## Contact Submissions

The public contact form uses `submitContactFormAction()` in `src/app/contact/actions.ts`.

Submissions are stored through `createContactSubmission()` in `src/lib/managed-data.ts` and displayed in `/studio`.

Before normal enquiry storage, the contact action verifies a local maths captcha from `src/lib/contact-captcha.ts` and checks the hidden `website` honeypot field. The captcha token is HMAC-signed and short-lived. Failed captcha and honeypot attempts are stored as blocked submission records when storage is available, with `type` values `captcha_failed` and `honeypot_spam`. Recent duplicate blocked attempts are suppressed in `createBlockedContactSubmission()`. Keep this third-party-free unless Jake explicitly asks for an external captcha service.

The Studio submissions inbox collapses repeated blocked attempts by fingerprint and uses coloured dots/card accents: green for real enquiries, amber for captcha failures and red for honeypot spam. `/studio/submissions` also supports mass-select with bulk status/delete actions through `bulkSubmissionAction()`. The page auto-refreshes through `src/components/studio/submissions-auto-refresh.tsx`, but pauses refresh while any submission checkbox is selected so it does not interrupt a bulk action.

Use `npm run test:contact-bot` to run the safe fake-bot tester in `scripts/test-contact-antispam.mjs`. By default it targets production and only tests rejected bot paths. A valid submission test requires `-- --valid`, and remote valid submissions require `-- --valid --allow-remote-valid`.

Statuses:

- `new`
- `reviewed`
- `replied`
- `archived`
- `blocked`

Email notifications are handled by `src/lib/email-notifications.ts` and called from `submitContactFormAction()` after both enquiry and blocked records are stored. Studio settings at `/studio/settings` let an admin set one or more recipient inboxes, comma-separated, and choose mode: `immediate`, `daily_digest`, `weekly_digest`, or `off`; the save action validates recipient email shape before writing to Neon. Notifications are currently paused: the persisted Neon setting is `mode: off`, `CONTACT_NOTIFICATION_FROM` is removed from Vercel, and failed direct SMTP testing is no longer active. Delivery normally uses the official `resend` package and needs `RESEND_API_KEY` plus `CONTACT_NOTIFICATION_FROM` in Vercel; never hard-code an `re_...` key in source. A quick direct SMTP fallback exists behind `CONTACT_NOTIFICATION_TRANSPORT=direct`, but the experiment failed for Jake and should stay off. Before public launch, verify the Eltronic domain in Resend and switch to a sender such as `notifications@eltronic.co.uk`, then change the recipient back to the preferred owner inbox if needed. Use `npm run email:check` to verify env vars, `npm run email:check -- --send --onboarding` for the Resend first-email test, `npm run email:check -- --send --direct` only if deliberately retesting direct SMTP, and `npm run email:check -- --send` to send a real configured notification test after credentials are configured.

## UI System

The public site uses the existing custom CSS in `src/app/globals.css`.

Public page visuals are code-native SVG modules, not bitmap files:

- Component: `src/components/site/technical-visuals.tsx`.
- Variants: `display`, `network`, `sectors`, `data`.
- Preferred for now because visuals remain editable, versioned and deployable without a media library.

The public shell also renders `src/components/site/ambient-background.tsx`, a very subtle fixed background layer with floating syntax glyphs. Keep it low opacity, behind content, and respectful of `prefers-reduced-motion`.

The homepage hero uses `src/components/site/hero-role-typewriter.tsx` for the small role label above `Eltronic`. It cycles through short professional role phrases and respects `prefers-reduced-motion`.

The public main navigation uses inline SVG icons in `src/components/site/site-shell.tsx`. Desktop shows the core customer journey links: Products, Solutions, Software, About and Contact. Mobile uses a compact native `details` hamburger with the same links, and `src/components/site/mobile-nav-auto-close.tsx` closes it on link click, outside tap or Escape. Keep secondary pages such as Sectors and Data & specification discoverable through page CTAs or footer links rather than crowding the primary nav.

The public footer is also rendered from `src/components/site/site-shell.tsx`. Keep it simple and static for now; the sticky reveal experiment made the footer appear behind content and was removed.

Workflow/process copy for public control-system integration and Software & Systems pages lives in `src/content/site.ts`. Keep it professional: complex engineering should be presented as controlled, clear and easy for the customer to move through, not as if the work itself is basic.

Public copy should avoid generic IT-support language and repeated machine/machinery phrasing unless clearly needed. Prefer precise but plain terms such as specialist equipment, operating environment, application, full-stack software, embedded services, connected devices, platform, control system, mobile plant, fixed installation, operator interface and operational workflow.

The admin uses Tailwind CSS v4 plus local shadcn-style primitives:

Studio page bodies should avoid large duplicate `h1` titles because `src/components/studio/studio-shell.tsx` already shows the current mode in the sticky top bar. Prefer compact `.studio-page-header` rows for short descriptions and actions.

The old WordPress/WooCommerce-style classic backend under `/studio/classic` has been removed. Keep Studio focused on the current product table, quick-edit drawer and full product editor unless Jake explicitly asks for another admin surface.

- `src/components/ui/button.tsx`
- `src/components/ui/card.tsx`
- `src/components/ui/input.tsx`
- `src/components/ui/textarea.tsx`
- `src/components/ui/label.tsx`
- `src/components/ui/badge.tsx`
- `src/components/ui/separator.tsx`

Do not install a second component system unless there is a clear reason.

## Deployment

Main branch pushes go to GitHub. Vercel production has been deployed manually with:

```bash
npx vercel --prod --yes
```

Expected production alias:

```text
https://project-5v5cr.vercel.app
```

Before relying on live admin writes, configure persistent database env vars in Vercel:

- `DATABASE_URL` or integration-prefixed `eltronic_db_1_DATABASE_URL`
- Fallback Redis support still accepts `KV_REST_API_URL` and `KV_REST_API_TOKEN`
- The removed Console experiment previously used a separate database schema. Do not run destructive database cleanup unless Jake explicitly asks; leaving old tables orphaned is safer than deleting potential backup data.

As of 2026-04-27, the Neon database `eltronic_db_1` is connected to Vercel and injects prefixed env vars such as `eltronic_db_1_DATABASE_URL`. `npm run storage:check` passes locally after pulling Vercel env vars, production deployment `dpl_DfWPHsfjnjTYoAuB8zkHqFRzni2j` is live, and the safe contact bot tester confirmed blocked attempts are saved in Neon.

## Agent Maintenance Rules

- Keep `docs/AI_FUNCTION_MAP.json` in sync when adding/changing routes, env vars, auth, storage, or server actions.
- Update `docs/SITE_FUNCTIONS.md` for human-level behavior changes.
- Update `docs/PROJECT_LOG.md` for deployment, architecture and migration milestones.
- Do not commit `.data/`.
- Do not expose real production secrets in docs.
- If in doubt, run `npm run lint` and `npm run build` before handoff.
