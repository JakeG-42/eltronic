import Link from "next/link";
import { TechnicalVisual } from "@/components/site/technical-visuals";
import { resourceModules } from "@/content/site";
import { getProducts } from "@/lib/managed-data";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Data & Specification",
  description:
    "Product data sheets, guides, specification resources and enquiry support for Eltronic products.",
  path: "/data-specification",
});

export const dynamic = "force-dynamic";

export default async function DataSpecificationPage() {
  const products = await getProducts();
  const documents = products.flatMap((product) =>
    (product.documents ?? []).map((document) => ({
      ...document,
      product: product.name,
    })),
  );

  return (
    <main className="page">
      <section className="hero compact-hero">
        <div className="hero-copy">
          <p className="code-kicker">data.specification</p>
          <h1>Data sheets, guides and product evidence.</h1>
          <p className="lede">
            Product documents, technical notes and enquiry support collected
            around the hardware and systems Eltronic can help specify.
          </p>
          <div className="actions">
            <Link className="button" href="/products">
              Match a product
            </Link>
            <Link className="button secondary" href="/contact">
              Ask for specification help
            </Link>
          </div>
        </div>
        <TechnicalVisual
          codeMark
          codeMotif="data"
          codeTheme="violet"
          label="Interactive data and specification workflow"
          variant="display"
        />
      </section>

      <section className="section">
        <div className="module-grid">
          {resourceModules.map((resource) => (
            <article className="feature-module" key={resource.title}>
              <h3>{resource.title}</h3>
              <p>{resource.summary}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <div>
            <span className="section-number">documents.index</span>
            <h2>Known product documents</h2>
          </div>
          <p>
            These links collect the technical resources currently attached to
            the catalogue and will expand as the product library grows.
          </p>
        </div>
        <div className="document-grid">
          {documents.length === 0 ? (
            <article className="panel">
              <h3>No documents attached yet</h3>
              <p>Technical documents can be requested with a product enquiry.</p>
            </article>
          ) : null}
          {documents.map((document) => (
            <a className="document-card" href={document.url} key={`${document.product}-${document.label}`}>
              <span>{document.product}</span>
              <strong>{document.label}</strong>
              <small>{formatDocumentDestination(document.url)}</small>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}

function formatDocumentDestination(url: string) {
  if (url.startsWith("/contact")) {
    return "Available on request";
  }

  try {
    return new URL(url).hostname;
  } catch {
    return "Product resource";
  }
}
