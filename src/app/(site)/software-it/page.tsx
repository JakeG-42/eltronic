import Link from "next/link";
import { TechnicalVisual } from "@/components/site/technical-visuals";
import { softwareServiceModules, softwareWorkflowModules } from "@/content/site";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Software & Systems",
  description:
    "Industrial software, PLC-adjacent applications, PCB programming support, control-unit software, connected devices and operational IT from Eltronic.",
  path: "/software-it",
});

export default function SoftwareItPage() {
  return (
    <main className="page">
      <section className="hero compact-hero">
        <div className="hero-copy">
          <p className="code-kicker">software.systems</p>
          <h1>Industrial software for control, devices and connected operations.</h1>
          <p className="lede">
            Eltronic develops the software that sits close to equipment: PLC
            and control-system applications, PCB and control-unit programming
            support, HMI and device interfaces, data capture, gateways,
            industrial PCs, dashboards and reliable operational IT around
            production environments.
          </p>
          <div className="actions">
            <Link className="button" href="/contact">
              Discuss a system
            </Link>
            <Link className="button secondary" href="/web-connected-platforms">
              Web & connected platforms
            </Link>
          </div>
        </div>
        <TechnicalVisual
          codeMark
          codeTheme="cyan"
          label="Software, hardware and system integration"
          variant="display"
        />
      </section>

      <section className="section">
        <div className="section-heading">
          <div>
            <span className="section-number">capability.map</span>
            <h2>Capability across the stack</h2>
          </div>
          <p>
            Work can sit in PLC-adjacent logic, embedded services, control
            units, industrial PCs, operator screens, gateways, databases,
            dashboards or the systems between them. The priority is always the
            same: dependable operation, useful data and a workflow the customer
            can actually use.
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
            <span className="section-number">web.platforms</span>
            <h2>Business platforms, websites and connected services sit next to this.</h2>
            <p>
              When the work is more company-facing, such as CRM-style tools,
              websites, UI/UX, finance, warehousing, manufacturing systems or
              platform integrations, it belongs on the Web & IOT side. The two
              areas connect when a web platform needs to talk to devices,
              production data or industrial systems.
            </p>
          </div>
          <Link className="button" href="/web-connected-platforms">
            Explore Web & Connected Platforms
          </Link>
        </div>
      </section>

      <section className="section">
        <div className="cta-module">
          <div>
            <span className="section-number">keep.clear</span>
            <h2>Bring the problem, not the category.</h2>
            <p>
              You do not need to know whether the answer is a PLC-adjacent
              application, HMI workflow, PCB programming support, gateway,
              dashboard, device service, database, industrial PC tool or process
              change. Describe where the work slows down, where data breaks,
              where errors enter or where people repeat the same task. We can
              shape the technical route from there.
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
            Serious software work can cross hardware, control units, industrial
            networks, users, data, hosting, security, remote access and existing
            manufacturing systems. The customer experience should still feel
            controlled, transparent and practical from first scope to handover.
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
