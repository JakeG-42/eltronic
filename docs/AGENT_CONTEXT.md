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
- `src/content/products.ts`: seed catalogue from the crawled WordPress site.
- `src/content/site.ts`: public services, software/IT, sector, workflow and resource module content.
- `src/components/site/technical-visuals.tsx`: code-native public-page technical visuals.
- `src/components/site/ambient-background.tsx`: subtle public-only floating syntax glyphs.
- `src/components/site/product-media-gallery.tsx`: interactive product image selection and zoom.
- `src/components/studio/product-image-manager.tsx`: Studio visual image preview/order editor.
- `public/product-images`: local product image assets used by the public catalogue.
- `public/product-images/placeholders`: explicit seed gallery placeholders that appear in Studio like normal managed images.
- `docs/AI_FUNCTION_MAP.json`: machine-readable feature map.

## Auth Model

Auth is intentionally simple at this stage: one admin login, no database-backed users yet.

- Login page: `src/app/studio/login/page.tsx`.
- Login action: `src/app/studio/login/actions.ts`.
- Auth utility: `src/lib/admin-auth.ts`.
- Studio guard: `src/app/studio/(admin)/layout.tsx` calls `isAdminAuthenticated()`.
- Admin mutations: `src/app/studio/actions.ts` calls `requireAdminAction()` before writes.

### Credential Sources

Credentials can be overridden by environment variables:

- `ELTRONIC_ADMIN_USERNAME`
- `ELTRONIC_ADMIN_PASSWORD`
- `ELTRONIC_ADMIN_SECRET`

Current temporary defaults are:

- login: `admin`
- password: `password`

The defaults are for testing only. Replace them before sharing the admin URL beyond the project team.

### Verification Flow

`verifyAdminCredentials(username, password)` compares the provided username and password against configured values.

- Values are HMAC-signed with SHA-256 using the admin secret.
- Signed values are compared with `timingSafeEqual`.
- This avoids plain string comparison timing leaks, but it is still a simple single-user auth system.
- No user record is currently stored.
- No role or permission model exists yet.

### Session Cookie

Successful login calls `setAdminSession()`.

- Cookie name: `eltronic_admin_session`.
- Cookie value shape: `<issuedAt>.<signature>`.
- Signature: HMAC-SHA256 of `issuedAt`.
- Max age: 7 days.
- Flags: `HttpOnly`, `SameSite=Lax`, `Secure` in production.
- Validation: `isAdminAuthenticated()` checks cookie presence, expiry and signature.

### Future Test Users

If Jake asks to inject test users later, do not bolt a second auth system beside this one. Extend `src/lib/admin-auth.ts` so the rest of the app can keep calling the same functions.

Recommended path:

- Add an `AdminUser` type with `username`, `passwordHash` or `password`, and optional `role`.
- Replace `getAdminUsername()` and `getAdminPassword()` with `getAdminUsers()`.
- Keep `verifyAdminCredentials(username, password)` as the public verification API.
- Make the session payload include a user id or username, then sign the payload instead of only `issuedAt`.
- Keep `isAdminAuthenticated()` available for simple guards.
- Optionally add `getCurrentAdminUser()` if role-aware UI is needed.
- Update `docs/AI_FUNCTION_MAP.json` when the auth model changes.

## Managed Data Model

The managed data layer is in `src/lib/managed-data.ts`.

Storage selection:

- If `KV_REST_API_URL` and `KV_REST_API_TOKEN` exist, use Upstash/Vercel KV through `@upstash/redis`.
- If KV is not configured and writes are allowed locally, use `.data/eltronic-data.json`.
- In production without KV, use seeded products as read-only fallback and block writes.

The `.data/` folder is gitignored because it can contain contact submissions and edited content.

## Studio Layout

Studio is intentionally separate from the public site chrome.

- Public pages live under the `(site)` route group and use `src/components/site/site-shell.tsx`.
- Studio pages live under `src/app/studio/(admin)` and use `src/components/studio/studio-shell.tsx`.
- `/studio/login` is outside the protected admin route group.
- Studio navigation modes are real routes: `/studio`, `/studio/products`, `/studio/submissions`, and `/studio/settings`.
- Studio theme is browser-local and toggled by `src/components/studio/studio-shell.tsx`.

## Product Management

Public catalogue pages read through `getProducts()` and `getProductBySlug()` from `src/lib/managed-data.ts`.

Admin product edits are handled by `saveProductAction()` in `src/app/studio/actions.ts`.

Product gallery editing in Studio uses `src/components/studio/product-image-manager.tsx`, which posts ordered repeated `imageSrc` and `imageAlt` fields. Product galleries should be managed through seed data or Studio image fields only; generated fallback gallery assets are not part of the public media model. `productFromFormData()` in `src/lib/managed-data.ts` keeps backward compatibility with legacy newline `images` form data, but the UI should stay visual rather than returning to textarea-based image ordering.

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

The Studio product form uses a WooCommerce-style two-column editing flow: main product sections on the left, with publish, commerce and module controls in a sticky sidebar on desktop. Keep sections collapsible when adding new product-management panels so the form remains manageable in the quick-edit drawer.

Product templates are currently:

- `hmi`
- `data-logger`
- `module`

Gallery behavior:

- `getProductImages(product)` returns managed media only: ordered `product.images` first, or the primary `product.image` if no gallery images are set.
- Placeholder gallery assets should be explicit `product.images` entries, not appended by hidden fallback logic.
- If a product needs multiple images, add them through Studio or seed data so the admin UI remains the source of truth.
- Product detail pages render `ProductMediaGallery`, a client component with thumbnail switching, keyboard-friendly zoom, and previous/next controls.
- Primary product images are local files under `public/product-images`; keep public pages off legacy media URLs.

If adding a new template, update:

- `ProductTemplate` in `src/content/products.ts`.
- `parseProductTemplate()` in `src/lib/managed-data.ts`.
- The template select in `src/components/studio/product-form.tsx`.
- `productTypeLabel` in `src/app/(site)/products/[slug]/page.tsx`.
- `docs/AI_FUNCTION_MAP.json`.

## Contact Submissions

The public contact form uses `submitContactFormAction()` in `src/app/contact/actions.ts`.

Submissions are stored through `createContactSubmission()` in `src/lib/managed-data.ts` and displayed in `/studio`.

Statuses:

- `new`
- `reviewed`
- `replied`
- `archived`

There is no email notification yet. A future email/CRM integration should call from `createContactSubmission()` or wrap the contact server action.

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

Public copy should avoid repeating generic machine/machinery phrasing unless it is clearly the industry term. Prefer more precise language such as specialist equipment, operating environment, application, platform, control system, mobile plant, fixed installation, operator interface and operational workflow.

The admin uses Tailwind CSS v4 plus local shadcn-style primitives:

Studio page bodies should avoid large duplicate `h1` titles because `src/components/studio/studio-shell.tsx` already shows the current mode in the sticky top bar. Prefer compact `.studio-page-header` rows for short descriptions and actions.

The protected classic backend lives under `/studio/classic/products`. `src/components/studio/studio-shell.tsx` switches to a WordPress-style shell for that route and the existing Studio topbar links to it with `Switch to new`. The classic product editor is `src/components/studio/classic/woocommerce-product-editor.tsx`; it saves through the same `saveProductAction` and should keep using the managed product data model unless a deliberate schema migration is planned. Treat it as a WordPress/WooCommerce-inspired management surface for Eltronic, not a real WooCommerce install.

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

Before relying on live admin writes, configure persistent KV env vars in Vercel:

- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`

As of 2026-04-27, `npx vercel env ls` returned no configured env vars for `project-5v5cr`, so production admin/contact writes should still be treated as not persistent until KV/Upstash is connected and redeployed.

## Agent Maintenance Rules

- Keep `docs/AI_FUNCTION_MAP.json` in sync when adding/changing routes, env vars, auth, storage, or server actions.
- Update `docs/SITE_FUNCTIONS.md` for human-level behavior changes.
- Update `docs/PROJECT_LOG.md` for deployment, architecture and migration milestones.
- Do not commit `.data/`.
- Do not expose real production secrets in docs.
- If in doubt, run `npm run lint` and `npm run build` before handoff.
