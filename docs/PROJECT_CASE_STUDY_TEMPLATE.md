# Project Case Study Template

Use this when adding public project/write-up pages under `src/content/projects.ts`.

## Required Fields

- `published`: Set to `true` only when the page is ready to appear on `/projects` and in `/sitemap.xml`.
- `slug`: Short lowercase URL path, for example `fleet-diagnostics-dashboard`.
- `title`: Clear customer-facing title.
- `summary`: One or two sentences for project cards.
- `metaDescription`: SEO description around 140-160 characters.
- `date`: ISO date such as `2026-04-27`.
- `intro`: Opening paragraph for the project page.
- `challenge`: What needed to be solved, in plain professional language.
- `outcomes`: Bullets focused on business or operational outcomes.
- `services`: Tags such as `CAN-Bus`, `API integration`, `Embedded services`, `Dashboard`, `Consultation`.
- `images`: Local image paths from `public/` with useful alt text.

## Suggested Page Shape

- Context: Who the work helped and what environment it supported.
- Problem: The friction, risk, data gap or workflow issue.
- Approach: What Eltronic designed, integrated, built or improved.
- Outcome: What became easier, more reliable, faster or clearer.
- Evidence: Photos, screenshots, diagrams, anonymised metrics or before/after notes.

## Writing Rules

- Keep it simple and professional; avoid inflated jargon.
- Mention concrete systems where helpful: HMI, CAN-Bus, APIs, dashboards, embedded services, internal platforms, connected devices, control systems.
- Avoid confidential customer names unless permission exists.
- Use original photos/screenshots where possible; do not reuse vendor or customer assets without permission.
- Every image needs descriptive alt text.

## Example Object

```ts
{
  published: false,
  slug: "example-control-dashboard",
  title: "Control Dashboard for Specialist Equipment",
  summary: "A concise summary of the customer need and the system Eltronic delivered.",
  metaDescription: "Eltronic project write-up covering control dashboard development, CAN-Bus data and operational workflow improvement.",
  date: "2026-04-27",
  intro: "Short opening paragraph explaining the project.",
  challenge: "Plain description of the issue, risk or workflow problem.",
  outcomes: [
    "Reduced manual checks by giving operators a clearer live view.",
    "Connected equipment data to an internal workflow without adding unnecessary steps.",
  ],
  services: ["CAN-Bus", "Dashboard", "API integration", "Consultation"],
  images: [
    {
      src: "/projects/example-control-dashboard/dashboard.jpg",
      alt: "Control dashboard interface used for specialist equipment monitoring",
    },
  ],
}
```
