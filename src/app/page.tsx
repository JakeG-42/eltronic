import Image from "next/image";
import Link from "next/link";
import { getFeaturedProducts, getProducts } from "@/lib/managed-data";

const capabilities = [
  {
    title: "HMI supply and integration",
    text: "Rugged TOPCON OPUS displays for agriculture, construction, logistics and industrial machinery.",
  },
  {
    title: "CAN data and diagnostics",
    text: "CAN-FD logging, edge processing, remote diagnostics and cloud-ready vehicle data capture.",
  },
  {
    title: "Bespoke control solutions",
    text: "Custom software, wiring, harnesses and control-system integration around real machinery needs.",
  },
];

const sectors = ["Agriculture", "Construction", "Logistics", "Industrial automation"];

export const dynamic = "force-dynamic";

export default async function Home() {
  const [products, featuredProducts] = await Promise.all([getProducts(), getFeaturedProducts()]);

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
            software integration for mobile and stationary machinery.
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

        <div className="terminal-panel" aria-label="Eltronic product interface preview">
          <div className="terminal-bar">
            <span className="terminal-dot" />
            <span className="terminal-dot" />
            <span className="terminal-dot" />
          </div>
          <div className="terminal-body">
            <p className="terminal-line">
              product.family: <strong>TOPCON OPUS</strong>
            </p>
            <p className="terminal-line">
              protocol.stack: <strong>CANbus / J1939 / CANopen</strong>
            </p>
            <p className="terminal-line">
              enquiry.mode: <strong>quote-first</strong>
            </p>
          </div>
          <div className="visual-product" />
        </div>
      </section>

      <section className="section">
        <div className="stats-grid">
          <div className="stat-card">
            <strong>{products.length}</strong>
            <span>public products crawled from the current site</span>
          </div>
          <div className="stat-card">
            <strong>3</strong>
            <span>initial product templates: HMI, data logger and module</span>
          </div>
          <div className="stat-card">
            <strong>4</strong>
            <span>core sectors carried over from the WordPress homepage</span>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <div>
            <span className="section-number">01</span>
            <h2>Machine-ready systems</h2>
          </div>
          <p>
            The old site content points to a clear product story: rugged HMIs,
            CAN data capture and bespoke integration work around specialist
            machinery.
          </p>
        </div>
        <div className="capability-grid">
          {capabilities.map((capability) => (
            <article className="capability-card panel" key={capability.title}>
              <h3>{capability.title}</h3>
              <p>{capability.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <div>
            <span className="section-number">02</span>
            <h2>Featured products</h2>
          </div>
          <p>
            These are powered from structured content now, not WordPress page
            builder blocks.
          </p>
        </div>
        <div className="product-grid">
          {featuredProducts.map((product) => (
            <Link className="product-card" href={`/products/${product.slug}`} key={product.slug}>
              <div className="product-media">
                <Image src={product.image.src} alt={product.image.alt} fill sizes="(max-width: 980px) 100vw, 33vw" />
              </div>
              <div className="product-content">
                <div className="tag-row">
                  <span className="tag">{product.family}</span>
                  <span className="tag warning">{product.template}</span>
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
            <h2>Application sectors</h2>
          </div>
          <p>
            The homepage crawl listed these sectors as first-class signals for
            where Eltronic products and integration work fit.
          </p>
        </div>
        <div className="tag-row">
          {sectors.map((sector) => (
            <span className="tag" key={sector}>
              {sector}
            </span>
          ))}
        </div>
      </section>
    </main>
  );
}
