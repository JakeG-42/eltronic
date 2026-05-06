import Link from "next/link";
import { TechnicalVisual } from "@/components/site/technical-visuals";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Web & Connected Platforms",
  description:
    "Bespoke websites, connected platforms, integrations, IoT data services, IT support and technical consultancy from Eltronic.",
  path: "/web-connected-platforms",
});

const platformCapabilities = [
  {
    code: "platform.build",
    title: "Bespoke platforms from the ground up",
    summary:
      "Custom portals, dashboards, workflow tools and operational systems built around the way the business actually needs to work.",
    examples: ["Customer portals", "Internal platforms", "Operational dashboards"],
  },
  {
    code: "modernise.connect",
    title: "Modernising older systems",
    summary:
      "Practical work to make older websites, databases, spreadsheets, desktop tools and business systems easier to maintain and connect.",
    examples: ["Legacy workflows", "Data cleanup", "Connectable interfaces"],
  },
  {
    code: "web.systems",
    title: "Websites that can become useful systems",
    summary:
      "New websites and rebuilds that keep the right visual direction while making room for integrations, forms, portals, stock, orders and future tools.",
    examples: ["Website rebuilds", "Design preservation", "Integration-ready foundations"],
  },
  {
    code: "api.bridge",
    title: "Linking existing platforms together",
    summary:
      "API, middleware and plugin work that connects ecommerce, Sage, shipping, warehouse, CRM, finance and operational systems without double entry.",
    examples: ["Shopify plugins", "Warehouse APIs", "Sage workflows"],
  },
  {
    code: "iot.data",
    title: "IoT and connected data services",
    summary:
      "Device data, sensors, gateways and dashboards that turn physical equipment and assets into useful information for the business.",
    examples: ["Telemetry", "Device dashboards", "Remote monitoring"],
  },
  {
    code: "it.consult",
    title: "IT support and technical consultancy",
    summary:
      "Support around hosting, access, remote desktop, internal infrastructure, technical choices and staged improvement plans.",
    examples: ["Remote access", "Hosting support", "Technical reviews"],
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
          <h1>Websites, platforms and systems that connect.</h1>
          <p className="lede">
            Eltronic builds new web platforms and modernises existing systems so
            they can work with the tools, data, devices and people already inside
            the business. That can mean a clean new build, a careful migration,
            a better integration layer, an IoT dashboard, or a website that keeps
            the right aesthetic while becoming far more useful.
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
        <TechnicalVisual codeMark label="Web and connected platform architecture" variant="display" />
      </section>

      <section className="section">
        <div className="section-heading">
          <div>
            <span className="section-number">platform.scope</span>
            <h2>Build new, connect old, improve what matters.</h2>
          </div>
          <p>
            This is not just website redesign. The work sits between web design,
            software engineering, IT, IoT and business systems consultancy.
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
              <span className="terminal-line">api.middleware</span>
              <span className="terminal-line">sage.workflow</span>
              <span className="terminal-line">warehouse.orders</span>
              <span className="terminal-line">iot.telemetry</span>
              <span className="terminal-line">customer.portal</span>
            </div>
          </figure>
          <div>
            <span className="section-number">keep.and.extend</span>
            <h2>Keep what works. Rebuild what holds the business back.</h2>
            <p className="lede">
              Sometimes the best answer is a new bespoke platform. Sometimes it
              is keeping the design direction, data or working process and
              rebuilding the technical foundation underneath it. The goal is not
              change for the sake of change. It is making the system easier to
              connect, support and improve.
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
