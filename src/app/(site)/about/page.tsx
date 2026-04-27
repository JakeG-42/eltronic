import Link from "next/link";
import { TechnicalVisual } from "@/components/site/technical-visuals";
import { sectorModules, workflowModules } from "@/content/site";

export const metadata = {
  title: "About | Eltronic",
  description: "About Eltronic engineering, product supply, systems integration and software support for equipment projects.",
};

const strengths = [
  {
    code: "application.context",
    title: "We start with the application",
    summary:
      "The right answer depends on environment, operators, protocols, duty cycle, support needs and what already exists on site.",
  },
  {
    code: "practical.integration",
    title: "Products become working systems",
    summary:
      "Displays, CAN data, I/O, harnesses, software and documentation are treated as one integration problem, not separate boxes.",
  },
  {
    code: "customer.clarity",
    title: "Complex work made clear",
    summary:
      "Customers should understand the route, the risks and the next decision without needing to translate engineering noise.",
  },
  {
    code: "long.term",
    title: "Built for support",
    summary:
      "A useful system is maintainable after delivery, with sensible handover, diagnostics and room for future improvement.",
  },
];

const capabilities = [
  "Rugged HMI displays and operator interfaces",
  "CANbus, CAN-FD, data logging and diagnostics",
  "Custom harnesses, wiring and control integration",
  "Embedded services, APIs, dashboards and internal systems",
  "Specification support, documentation and lifecycle improvement",
];

export default function AboutPage() {
  return (
    <main className="page">
      <section className="about-hero section">
        <div>
          <p className="code-kicker">about.eltronic</p>
          <h1>Control systems, displays and connected data.</h1>
          <p className="lede">
            Eltronic supports mobile plant, specialist vehicles and fixed
            industrial equipment with rugged HMI displays, CAN data, bespoke
            integration and software systems that reduce friction between
            hardware, operators and business workflows.
          </p>
          <div className="actions">
            <Link className="button" href="/contact">
              Start a project conversation
            </Link>
            <Link className="button secondary" href="/products">
              Browse products
            </Link>
          </div>
        </div>

        <TechnicalVisual label="Eltronic data and systems architecture" variant="network" />
      </section>

      <section className="about-intro-grid section">
        <article className="about-statement panel">
          <span className="section-number">why.eltronic</span>
          <h2>Not just a catalogue. Not just code. The useful bit in the middle.</h2>
          <p>
            A product only matters once it is specified correctly, wired into the
            real operating environment, configured around the operator and supported by clear
            information. That is the space Eltronic works in.
          </p>
          <p>
            The work can involve an HMI display, CAN logging, a control module,
            a custom workflow, an internal system or all of them together. The
            aim is the same: make the technical path controlled, understandable
            and reliable.
          </p>
        </article>

        <div className="about-proof-grid">
          {strengths.map((item) => (
            <article className="about-proof-card" key={item.code}>
              <span>{item.code}</span>
              <h3>{item.title}</h3>
              <p>{item.summary}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <div>
            <span className="section-number">what.we.do</span>
            <h2>Engineering support across the whole system.</h2>
          </div>
          <p>
            Customers can come in through a product requirement, an equipment
            problem, a workflow bottleneck or a systems integration need.
          </p>
        </div>
        <div className="about-capability-panel">
          <div>
            <h3>Core capability</h3>
            <p>
              Eltronic sits between product supply, equipment integration and
              practical software delivery, helping customers make good technical
              decisions without overcomplicating the project.
            </p>
          </div>
          <ul className="about-capability-list">
            {capabilities.map((capability) => (
              <li key={capability}>{capability}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <div>
            <span className="section-number">how.we.work</span>
            <h2>Structured enough for control. Flexible enough for real projects.</h2>
          </div>
          <p>
            Engineering projects rarely move in perfect straight lines. The work
            stays calm when discovery, specification, delivery and support are
            handled deliberately.
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

      <section className="section">
        <div className="split-module reverse">
          <div className="panel about-sector-panel">
            <span className="section-number">where.it.fits</span>
            <h2>Built around practical environments.</h2>
            <p>
              Agriculture, construction, logistics and industrial automation all
              have different pressures. The common thread is reliability,
              operator clarity and systems that can be maintained.
            </p>
            <div className="tag-row">
              {sectorModules.map((sector) => (
                <span className="tag" key={sector.title}>
                  {sector.title}
                </span>
              ))}
            </div>
            <div className="actions">
              <Link className="button secondary" href="/sectors">
                View sectors
              </Link>
            </div>
          </div>
          <div className="about-quote-card">
            <span>Eltronic approach</span>
            <p>
              Make the technical work robust, and make the customer experience
              simple enough to move forward with confidence.
            </p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="cta-module about-cta">
          <div>
            <span className="section-number">next.step</span>
            <h2>Bring the product, platform or workflow challenge.</h2>
            <p>
              We can help shape the route from early specification through to
              hardware, software, integration and support.
            </p>
          </div>
          <Link className="button" href="/contact">
            Start an enquiry
          </Link>
        </div>
      </section>
    </main>
  );
}
