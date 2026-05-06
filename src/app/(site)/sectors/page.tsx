import Link from "next/link";
import { TechnicalVisual } from "@/components/site/technical-visuals";
import { sectorModules } from "@/content/site";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Applications",
  description:
    "Eltronic application areas including specialist vehicles, fleet systems, simulators, internal tools and business operations.",
  path: "/sectors",
});

export default function SectorsPage() {
  return (
    <main className="page">
      <section className="hero compact-hero">
        <div className="hero-copy">
          <p className="code-kicker">sectors.map</p>
          <h1>Technical systems for real working environments.</h1>
          <p className="lede">
            Eltronic supports applications where hardware, software, data and
            practical operations need to work together without becoming harder
            to manage.
          </p>
          <div className="actions">
            <Link className="button" href="/contact">
              Discuss your sector
            </Link>
            <Link className="button secondary" href="/solutions">
              View services
            </Link>
          </div>
        </div>
        <TechnicalVisual label="Application sector map" variant="sectors" />
      </section>

      <section className="section">
        <div className="sector-grid">
          {sectorModules.map((sector) => (
            <article className="sector-card" key={sector.title}>
              <span className="section-number">{sector.code}</span>
              <h2>{sector.title}</h2>
              <p>{sector.summary}</p>
              <div className="tag-row">
                {sector.examples.map((example) => (
                  <span className="tag" key={example}>
                    {example}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="cta-module">
          <div>
            <span className="section-number">sector.quote</span>
            <h2>Not seeing your exact application?</h2>
            <p>
              The site is quote-led by design. If the project involves
              specialist equipment, operator interfaces, tracking, plugins,
              electronics, business systems or software integration, it is worth
              starting a conversation.
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
