# Launch Checklist

Use this before pointing `eltronic.co.uk` at Vercel.

## Done In This Pass

- Offline backup created in `/Users/jake/Documents/Eltronic_backups`.
- `dev` branch created from current `main` and pushed to GitHub.
- Studio auth moved from one shared login to managed user accounts with roles.
- Seeded super-admin accounts are present for the bootstrap admin and Jake.
- User passwords are stored as salted `scrypt` hashes, not plaintext.
- Password changes/reset paths bump the user session version so old sessions are invalidated.
- Public footer no longer links to Studio.
- Product placeholders are filtered out of public gallery/sitemap output.
- Each product now has generated technical overview, interface and application-context gallery illustrations in addition to its primary product image.
- Generated product gallery paths have been synced into Neon managed product data so Studio can preview, reorder or remove them.
- The I&Q CAN-Bus module copy no longer shows unfinished `TBU`/`To be updated` content.
- Empty Projects page copy no longer mentions source-code editing, and the Projects index is omitted from the sitemap until a project is published.
- Contact storage errors use neutral customer-facing copy.
- Removed the separate Console CMS and `/v2` sandbox so launch work stays focused on the current public site and `/studio`.

## Manual Before Public Launch

- Test Studio login with the permanent super-admin account.
- Delete the temporary `admin` bootstrap account manually only after the permanent account works.
- Replace generated product gallery illustrations with real product/application photos where available, or keep them as supporting technical diagrams.
- Add real project case studies with photos before linking Projects publicly.
- Confirm product document links: replace request-only document cards with real datasheets where possible.
- Set `NEXT_PUBLIC_SITE_URL=https://eltronic.co.uk` in Vercel after DNS is ready, then redeploy.
- Remove unused Console/new-site env vars and domain wiring from Vercel/IONOS if they are still configured.
- Submit `https://eltronic.co.uk/sitemap.xml` in Google Search Console after the domain is live.
- Decide whether email notifications remain paused or Resend is re-enabled with a verified Eltronic sender.
- Do a final mobile check of the homepage, product detail pages, gallery gestures, contact form and footer.
