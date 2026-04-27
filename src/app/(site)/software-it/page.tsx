import Link from "next/link";
import { TechnicalVisual } from "@/components/site/technical-visuals";
import { softwareServiceModules, softwareWorkflowModules } from "@/content/site";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Software & Systems",
  description:
    "Full-stack software, internal systems, API integrations, embedded services, IoT workflows and technical consultation from Eltronic.",
  path: "/software-it",
});

export default function SoftwareItPage() {
  return (
    <main className="page">
      <section className="hero compact-hero">
        <div className="hero-copy">
          <p className="code-kicker">software.systems</p>
          <h1>Software engineering for connected operations.</h1>
          <p className="lede">
            Eltronic designs and builds the software layer around equipment,
            people and business systems: internal platforms, APIs, embedded
            services, device data, dashboards and the integrations that remove
            manual work without making the operation harder to run.
          </p>
          <div className="actions">
            <Link className="button" href="/contact">
              Discuss a system
            </Link>
            <Link className="button secondary" href="/solutions">
              View control-system solutions
            </Link>
          </div>
        </div>
        <TechnicalVisual label="Software, hardware and system integration" variant="network" />
      </section>

      <section className="section">
        <div className="section-heading">
          <div>
            <span className="section-number">capability.map</span>
            <h2>Capability across the stack</h2>
          </div>
          <p>
            Work can sit in the browser, backend, database, device, gateway or
            the systems between them. The priority is always the same: reliable
            data, fewer errors and a workflow the customer can actually use.
          </p>
        </div>
        <div className="module-grid">
          {softwareServiceModules.map((service) => (
            <article className="feature-module" key={service.title}>
              <span className="section-number">{service.code}</span>
              <h3>{service.title}</h3>
              <p>{service.summary}</p>
              <ul className="mini-list">
                {service.examples.map((example) => (
                  <li key={example}>{example}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="cta-module">
          <div>
            <span className="section-number">keep.clear</span>
            <h2>Bring the problem, not the category.</h2>
            <p>
              You do not need to know whether the answer is an API, dashboard,
              embedded service, database, device workflow or process change.
              Describe where the work slows down, where data breaks, where
              errors enter or where people repeat the same task. We can shape
              the technical route from there.
            </p>
          </div>
          <Link className="button" href="/contact">
            Start with the problem
          </Link>
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <div>
            <span className="section-number">delivery.flow</span>
            <h2>Complex delivery without confusion</h2>
          </div>
          <p>
            Serious software work can cross hardware, users, data, hosting,
            security and existing business tools. The customer experience should
            still feel controlled, transparent and practical from first scope to
            handover.
          </p>
        </div>
        <div className="process-grid">
          {softwareWorkflowModules.map((step) => (
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
    </main>
  );
}
