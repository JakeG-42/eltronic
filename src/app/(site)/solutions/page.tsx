import Link from "next/link";
import { TechnicalVisual } from "@/components/site/technical-visuals";
import { serviceModules, workflowModules } from "@/content/site";

export const metadata = {
  title: "Solutions | Eltronic",
  description:
    "HMI, CAN-Bus, harness, software and bespoke control-system integration solutions for specialist equipment.",
};

export default function SolutionsPage() {
  return (
    <main className="page">
      <section className="hero compact-hero">
        <div className="hero-copy">
          <p className="code-kicker">solutions.stack</p>
          <h1>Integrated systems for demanding applications.</h1>
          <p className="lede">
            Eltronic combines rugged operator interfaces, CAN-Bus integration,
            custom software and project-specific harnessing for mobile and
            stationary equipment.
          </p>
          <div className="actions">
            <Link className="button" href="/contact">
              Start a project enquiry
            </Link>
            <Link className="button secondary" href="/products">
              Browse products
            </Link>
          </div>
        </div>
        <TechnicalVisual label="Control-system network" variant="network" />
      </section>

      <section className="section">
        <div className="section-heading">
          <div>
            <span className="section-number">01</span>
            <h2>Core solution modules</h2>
          </div>
          <p>
            A practical view of the services that sit around every successful
            HMI, CAN-Bus or control-system project.
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
          <TechnicalVisual label="HMI interface architecture" variant="display" />
          <div>
            <span className="section-number">02</span>
            <h2>From display choice to working system.</h2>
            <p className="lede">
              The product catalogue gives the hardware options. The solution
              work connects that hardware to CAN protocols, operator tasks,
              environmental requirements and service expectations.
            </p>
            <div className="actions">
              <Link className="button secondary" href="/data-specification">
                View data resources
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="cta-module">
          <div>
            <span className="section-number">software.systems</span>
            <h2>Need the operational system around it too?</h2>
            <p>
              Eltronic can also help with internal systems, API integrations,
              embedded services, server-side workflows, CRMs and practical
              consulting around operational efficiency.
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
            Integration projects have moving parts. The process keeps decisions,
            risks and next steps clear from enquiry through support.
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
