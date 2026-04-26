import Link from "next/link";
import { TechnicalVisual } from "@/components/site/technical-visuals";
import { serviceModules, workflowModules } from "@/content/site";

export const metadata = {
  title: "Solutions | Eltronic",
  description:
    "HMI, CANbus, harness, software and bespoke control-system integration solutions for machinery.",
};

export default function SolutionsPage() {
  return (
    <main className="page">
      <section className="hero compact-hero">
        <div className="hero-copy">
          <p className="code-kicker">solutions.stack</p>
          <h1>Built around the machine.</h1>
          <p className="lede">
            Eltronic combines rugged operator interfaces, CANbus integration,
            custom software and project-specific harnessing for mobile and
            stationary machinery.
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
            HMI, CANbus or machine-control project.
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
            <h2>Need the system around the machine too?</h2>
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
            <h2>Project workflow</h2>
          </div>
          <p>
            A simple way to explain what happens between a product enquiry and
            a practical machine-ready solution.
          </p>
        </div>
        <div className="process-grid">
          {workflowModules.map((step) => (
            <article className="process-card" key={step.step}>
              <strong>{step.step}</strong>
              <h3>{step.title}</h3>
              <p>{step.summary}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
