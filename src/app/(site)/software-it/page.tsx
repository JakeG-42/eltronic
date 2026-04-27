import Link from "next/link";
import { TechnicalVisual } from "@/components/site/technical-visuals";
import { softwareServiceModules, softwareWorkflowModules } from "@/content/site";

export const metadata = {
  title: "Software & Systems | Eltronic",
  description:
    "Bespoke software, internal systems, API integrations, embedded services, servers and technical consultation from Eltronic.",
};

export default function SoftwareItPage() {
  return (
    <main className="page">
      <section className="hero compact-hero">
        <div className="hero-copy">
          <p className="code-kicker">software.systems</p>
          <h1>Software, systems and practical integration.</h1>
          <p className="lede">
            Bespoke software, internal systems, API integrations, embedded
            services and technical consultation for teams that need their
            operation to work more efficiently, with fewer errors and less
            manual admin.
          </p>
          <div className="actions">
            <Link className="button" href="/contact">
              Discuss a project
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
            <span className="section-number">service.map</span>
            <h2>What we can help with</h2>
          </div>
          <p>
            A compact service map for the wider software, systems and
            integration work that often sits around equipment, operations,
            logistics and business processes.
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
            <h2>Not sure what category your problem fits?</h2>
            <p>
              That is fine. Send the rough version of the problem: what is
              slow, manual, disconnected, unreliable or causing avoidable
              errors. We can help decide whether it needs software, an
              integration, a server-side service, embedded messaging or a
              better process.
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
            <h2>Complex systems, made straightforward</h2>
          </div>
          <p>
            The work can involve several systems, protocols and stakeholders.
            The delivery should still feel clear, controlled and easy to
            understand.
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
