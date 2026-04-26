import Link from "next/link";
import { TechnicalVisual } from "@/components/site/technical-visuals";
import { softwareServiceModules, softwareWorkflowModules } from "@/content/site";

export const metadata = {
  title: "Software & IT | Eltronic",
  description:
    "Custom software, API integrations, practical IT support, hardware setup and technical consultation from Eltronic.",
};

export default function SoftwareItPage() {
  return (
    <main className="page">
      <section className="hero compact-hero">
        <div className="hero-copy">
          <p className="code-kicker">software.it</p>
          <h1>Software, IT and practical integration.</h1>
          <p className="lede">
            From custom backend systems and API integrations to CCTV, printers,
            connected hardware and technical advice, the aim is simple: make
            the technology around your operation work together.
          </p>
          <div className="actions">
            <Link className="button" href="/contact">
              Discuss a project
            </Link>
            <Link className="button secondary" href="/solutions">
              View machine solutions
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
            A compact service map for the wider software, IT and integration
            work that often sits around machinery, operations and business
            systems.
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
            <span className="section-number">keep.it.clear</span>
            <h2>Not sure what category your problem fits?</h2>
            <p>
              That is fine. Send the rough version of the problem: what is
              slow, manual, disconnected or unreliable. We can help decide
              whether it needs software, hardware, configuration or simply
              better advice.
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
            <h2>How we keep it manageable</h2>
          </div>
          <p>
            Broad capability does not need to become a complicated project.
            The work is scoped around useful steps and clear outcomes.
          </p>
        </div>
        <div className="process-grid">
          {softwareWorkflowModules.map((step) => (
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
