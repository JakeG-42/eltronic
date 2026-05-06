import Link from "next/link";
import { TechnicalVisual } from "@/components/site/technical-visuals";
import { serviceModules, workflowModules } from "@/content/site";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Services",
  description:
    "Bespoke technical systems, prototypes, electronics, software and integration services from Eltronic.",
  path: "/solutions",
});

export default function SolutionsPage() {
  return (
    <main className="page">
      <section className="hero compact-hero">
        <div className="hero-copy">
          <p className="code-kicker">solutions.stack</p>
          <h1>Bespoke systems, prototypes and integration.</h1>
          <p className="lede">
            Eltronic helps turn technical requirements into working systems:
            prototypes, screens, CAN interfaces, electronics, backend software,
            plugins, APIs and the support needed to keep them useful.
          </p>
          <div className="actions">
            <Link className="button" href="/contact">
              Start a project enquiry
            </Link>
            <Link className="button secondary" href="/products">
              Browse product modules
            </Link>
          </div>
        </div>
        <TechnicalVisual codeMark codeTheme="emerald" label="Eltronic service architecture" variant="display" />
      </section>

      <section className="section">
        <div className="section-heading">
          <div>
            <span className="section-number">01</span>
            <h2>What we help design, build and connect</h2>
          </div>
          <p>
            The work can start as a prototype, a product idea, a machine
            interface, an internal system or a messy integration problem. The
            service is shaped around the application rather than a fixed package.
          </p>
        </div>
        <div className="module-grid">
          {serviceModules.map((service) => (
            <article className="feature-module" key={service.slug}>
              <span className="section-number">{service.eyebrow}</span>
              <h3>{service.title}</h3>
              <p>{service.summary}</p>
              <ul className="mini-list">
                {service.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="split-module reverse">
          <TechnicalVisual label="Technical system architecture" variant="display" />
          <div>
            <span className="section-number">02</span>
            <h2>Products are building blocks, not the boundary.</h2>
            <p className="lede">
              The catalogue shows some of the hardware, modules and products we
              can supply or build around. The wider value is in adapting,
              connecting and supporting those pieces inside a complete system.
            </p>
            <div className="actions">
              <Link className="button secondary" href="/products">
                View product catalogue
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="cta-module">
          <div>
            <span className="section-number">software.systems</span>
            <h2>Need the software, data or business layer too?</h2>
            <p>
              Eltronic also builds internal tools, API integrations, Shopify and
              bespoke plugins, dashboards, remote access workflows and server-side
              systems that connect the technical work to daily operations.
            </p>
          </div>
          <Link className="button" href="/software-it">
            View Software & Systems
          </Link>
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <div>
            <span className="section-number">03</span>
            <h2>Professional delivery, made straightforward</h2>
          </div>
          <p>
            Mixed hardware, software and product work can have a lot of moving
            parts. The process keeps decisions, risks and next steps clear from
            enquiry through support.
          </p>
        </div>
        <div className="process-grid">
          {workflowModules.map((step) => (
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
