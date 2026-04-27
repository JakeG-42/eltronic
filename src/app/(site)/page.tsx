import Image from "next/image";
import Link from "next/link";
import { TechnicalVisual } from "@/components/site/technical-visuals";
import { sectorModules, serviceModules, workflowModules } from "@/content/site";
import { getFeaturedProducts } from "@/lib/managed-data";

export const dynamic = "force-dynamic";

export default async function Home() {
  const featuredProducts = await getFeaturedProducts();

  return (
    <main className="page">
      <section className="hero">
        <div className="hero-copy">
          <p className="code-kicker">systems.integrator</p>
          <h1 className="hero-title">
            <span className="title-prefix">const partner =</span>
            <span className="title-value gradient-text">Eltronic</span>
            <span className="title-suffix">;</span>
          </h1>
          <p className="lede">
            Intelligent HMI displays, CAN data logging, custom harnesses and
            software integration for mobile equipment, fixed installations and
            specialist vehicles.
          </p>
          <div className="actions">
            <Link className="button" href="/products">
              Browse products
            </Link>
            <Link className="button secondary" href="/contact">
              Start an enquiry
            </Link>
          </div>
        </div>

        <TechnicalVisual label="HMI, CANbus and control-system architecture" variant="display" />
      </section>

      <section className="section">
        <div className="section-heading">
          <div>
            <span className="section-number">01</span>
            <h2>Application-ready systems</h2>
          </div>
          <p>
            Rugged HMIs, CAN data capture and bespoke integration work come
            together around the operator, environment and project requirement.
          </p>
        </div>
        <div className="capability-grid">
          {serviceModules.map((capability) => (
            <article className="capability-card panel" key={capability.title}>
              <span className="section-number">{capability.eyebrow}</span>
              <h3>{capability.title}</h3>
              <p>{capability.summary}</p>
            </article>
          ))}
        </div>
        <div className="actions">
          <Link className="button secondary" href="/solutions">
            Explore solutions
          </Link>
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <div>
            <span className="section-number">02</span>
            <h2>Featured products</h2>
          </div>
          <p>
            A focused selection of displays, data logging tools and control
            modules for quote-led equipment projects.
          </p>
        </div>
        <div className="product-grid">
          {featuredProducts.map((product) => (
            <Link className="product-card" href={`/products/${product.slug}`} key={product.slug}>
              <div className="product-media">
                <Image
                  src={product.image.src}
                  alt={product.image.alt}
                  fill
                  sizes="(max-width: 680px) 50vw, (max-width: 980px) 50vw, 33vw"
                />
              </div>
              <div className="product-content">
                <div className="tag-row">
                  <span className="tag">{product.family}</span>
                  <span className="tag warning">{product.category}</span>
                </div>
                <h3>{product.name}</h3>
                <p>{product.summary}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <div>
            <span className="section-number">03</span>
            <h2>Software and systems integration</h2>
          </div>
          <p>
            Bespoke internal systems, API integration, embedded services and
            practical consulting for more efficient operations.
          </p>
        </div>
        <div className="cta-module">
          <div>
            <span className="section-number">software.systems</span>
            <h2>Business systems, data and integrations.</h2>
            <p>
              From shipping and CRM integrations to MQTT services, HTTP APIs,
              internal servers, dashboards and custom workflows, we help reduce
              errors, manual admin and wasted time.
            </p>
          </div>
          <Link className="button" href="/software-it">
            Explore Software & Systems
          </Link>
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <div>
            <span className="section-number">04</span>
            <h2>Complex projects, made straightforward</h2>
          </div>
          <p>
            The engineering can be detailed. The customer experience should
            still feel clear, structured and easy to move through.
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
        <div className="split-module">
          <TechnicalVisual label="Eltronic sector map" variant="sectors" />
          <div>
            <span className="section-number">05</span>
            <h2>Application sectors</h2>
            <p className="lede">
              Agriculture, construction, logistics and industrial automation
              each have different pressures around reliability, operator
              feedback and maintainable control systems.
            </p>
            <div className="tag-row">
              {sectorModules.map((sector) => (
                <span className="tag" key={sector.title}>
                  {sector.title}
                </span>
              ))}
            </div>
            <div className="actions">
              <Link className="button" href="/sectors">
                View sectors
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
