import Link from "next/link";
import { TechnicalVisual } from "@/components/site/technical-visuals";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Web & Connected Platforms",
  description:
    "Company websites, CRM-style platforms, UI/UX, connected services, IoT dashboards, business integrations and IT support from Eltronic.",
  path: "/web-connected-platforms",
});

const platformCapabilities = [
  {
    code: "web.design",
    title: "Company websites and UI/UX",
    summary:
      "Modern websites, redesigns and interface systems that look right, feel clear and are built with future integrations in mind.",
    examples: ["Website design", "UI/UX", "Design systems"],
  },
  {
    code: "crm.platforms",
    title: "CRM and customer platforms",
    summary:
      "Customer portals, enquiry workflows, account areas, dashboards and CRM-style systems built around how the company actually works.",
    examples: ["CRM-style tools", "Customer portals", "Sales dashboards"],
  },
  {
    code: "modernise.connect",
    title: "Modernising older systems",
    summary:
      "Practical work to make older websites, databases, spreadsheets, desktop tools and business systems easier to maintain, support and connect.",
    examples: ["Legacy workflows", "Data cleanup", "Platform migration"],
  },
  {
    code: "business.bridge",
    title: "Business system connections",
    summary:
      "API, middleware and plugin work that connects ecommerce, finance, warehousing, manufacturing, logistics, CRM and reporting systems without double entry.",
    examples: ["Finance links", "Warehouse APIs", "Manufacturing data"],
  },
  {
    code: "ops.visibility",
    title: "Operational dashboards and reporting",
    summary:
      "Web dashboards and reporting views that bring orders, jobs, stock, production status, service activity and management information into one clearer place.",
    examples: ["Job tracking", "Stock visibility", "Management reports"],
  },
  {
    code: "studio.support",
    title: "Design studio and IT agency support",
    summary:
      "A practical support layer for companies that need design, web changes, hosting guidance, access setup, technical decisions and ongoing improvement.",
    examples: ["Website support", "Hosting guidance", "Technical reviews"],
  },
  {
    code: "iot.data",
    title: "IoT and connected data services",
    summary:
      "Device data, sensors, gateways and dashboards that turn physical equipment and assets into useful information for the business.",
    examples: ["Telemetry", "Device dashboards", "Remote monitoring"],
  },
];

const platformApproach = [
  {
    step: "01",
    title: "Understand what already exists",
    summary:
      "We map the current website, platform, data, users, integrations, manual workarounds and the systems people rely on every day.",
    outcome: "A clear view of what should stay, what is causing friction and what needs to connect.",
  },
  {
    step: "02",
    title: "Choose whether to adapt, rebuild or replace",
    summary:
      "Some projects need a clean new build. Others need careful migration, a better integration layer or targeted improvements around a working system.",
    outcome: "A practical route that avoids unnecessary rebuilds while still fixing the real limitation.",
  },
  {
    step: "03",
    title: "Build the connection layer",
    summary:
      "Web interfaces, APIs, plugins, databases, dashboards, IoT services and access controls are delivered in controlled stages.",
    outcome: "A working platform that connects the people, data, tools and devices it needs to support.",
  },
  {
    step: "04",
    title: "Support and improve it over time",
    summary:
      "Documentation, hosting support, monitoring and sensible future updates keep the platform useful as the business changes.",
    outcome: "A maintainable system with a clear path for support, improvement and new integrations.",
  },
];

export default function WebConnectedPlatformsPage() {
  return (
    <main className="page">
      <section className="hero compact-hero">
        <div className="hero-copy">
          <p className="code-kicker">web.connected.platforms</p>
          <h1>Websites, CRM tools and business platforms that connect.</h1>
          <p className="lede">
            Eltronic builds company websites, CRM-style tools, connected
            platforms and IoT dashboards that work with the data, people and
            systems already inside the business. That can mean a clean new
            build, a careful migration, a design refresh, a better integration
            layer, or a platform that connects finance, warehousing,
            manufacturing and customer workflows.
          </p>
          <div className="actions">
            <Link className="button" href="/contact">
              Discuss a platform
            </Link>
            <Link className="button secondary" href="/software-it">
              View software services
            </Link>
          </div>
        </div>
        <TechnicalVisual codeMark codeTheme="teal" label="Web and connected platform architecture" variant="display" />
      </section>

      <section className="section">
        <div className="section-heading">
          <div>
            <span className="section-number">platform.scope</span>
            <h2>Build new, connect old, improve what matters.</h2>
          </div>
          <p>
            This is the company-facing side of Eltronic: web design, UI/UX,
            connected platforms, CRM-style workflows, business-system
            integrations, IoT dashboards and practical IT support.
          </p>
        </div>
        <div className="module-grid">
          {platformCapabilities.map((capability) => (
            <article className="feature-module" key={capability.title}>
              <span className="section-number">{capability.code}</span>
              <h3>{capability.title}</h3>
              <p>{capability.summary}</p>
              <ul className="mini-list">
                {capability.examples.map((example) => (
                  <li key={example}>{example}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="split-module reverse">
          <figure className="terminal-panel" aria-label="Platform integration example">
            <div className="terminal-bar">
              <span className="terminal-dot" />
              <span className="terminal-dot" />
              <span className="terminal-dot" />
            </div>
            <div className="terminal-body">
              <span className="terminal-line">existing.platform</span>
              <span className="terminal-line">website.frontend</span>
              <span className="terminal-line">crm.workflow</span>
              <span className="terminal-line">api.middleware</span>
              <span className="terminal-line">finance.systems</span>
              <span className="terminal-line">warehouse.orders</span>
              <span className="terminal-line">manufacturing.jobs</span>
              <span className="terminal-line">iot.telemetry</span>
            </div>
          </figure>
          <div>
            <span className="section-number">keep.and.extend</span>
            <h2>Keep what works. Rebuild what holds the business back.</h2>
            <p className="lede">
              Sometimes the best answer is a new bespoke platform. Sometimes it
              is keeping the design direction, brand feel, data or working
              process and rebuilding the technical foundation underneath it. The
              goal is not change for the sake of change. It is making the
              system easier to use, connect, support and improve.
            </p>
            <div className="actions">
              <Link className="button secondary" href="/contact">
                Talk through the current setup
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <div>
            <span className="section-number">delivery.route</span>
            <h2>A practical route through messy systems.</h2>
          </div>
          <p>
            Existing platforms often have hidden value and hidden problems. The
            process separates what should be kept from what needs to be rebuilt,
            connected or retired.
          </p>
        </div>
        <div className="process-grid">
          {platformApproach.map((step) => (
            <article className="process-card" key={step.step} tabIndex={0}>
              <strong>{step.step}</strong>
              <h3>{step.title}</h3>
              <p>{step.summary}</p>
              <small className="process-outcome">
                <span>Outcome</span>
                {step.outcome}
              </small>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="cta-module">
          <div>
            <span className="section-number">next.platform</span>
            <h2>Have an old system, a new idea or a platform that needs to connect?</h2>
            <p>
              Send the website, workflow, system or integration problem. We can
              help decide whether it should be adapted, connected, rebuilt or
              replaced with something bespoke.
            </p>
          </div>
          <Link className="button" href="/contact">
            Start a platform enquiry
          </Link>
        </div>
      </section>
    </main>
  );
}
