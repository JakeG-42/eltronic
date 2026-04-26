import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductMediaGallery } from "@/components/site/product-media-gallery";
import { getProductBySlug, getProductImages } from "@/lib/managed-data";

type ProductPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {};
  }

  return {
    title: `${product.name} | Eltronic`,
    description: product.summary,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }
  const images = getProductImages(product);

  return (
    <main className="page">
      <section className="detail-hero">
        <div>
          <p className="code-kicker">{product.family}</p>
          <h1>{product.name}</h1>
          <p className="lede">{product.description}</p>
          <div className="actions">
            <Link className="button" href={`/contact?product=${product.slug}`}>
              {product.enquiryPrompt}
            </Link>
          </div>
        </div>

        <ProductMediaGallery images={images} productName={product.name} />
      </section>

      <section className="detail-layout">
        <div className="stack">
          <section className="panel">
            <div className="tag-row">
              <span className="tag">{productTypeLabel[product.template]}</span>
              <span className="tag warning">{product.category}</span>
            </div>
            <h2>Highlights</h2>
            <ul className="highlight-list">
              {product.highlights.map((highlight) => (
                <li key={highlight}>{highlight}</li>
              ))}
            </ul>
          </section>

          {product.variants ? (
            <section className="panel">
              <h2>Order information</h2>
              <ul className="variant-list">
                {product.variants.map((variant) => (
                  <li key={`${variant.name}-${variant.articleNumber ?? variant.details}`}>
                    <strong>{variant.name}</strong>
                    <p>{variant.details}</p>
                    {variant.articleNumber ? <span className="tag">{variant.articleNumber}</span> : null}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>

        <aside className="stack">
          <section className="panel">
            <h2>Technical data</h2>
            <dl className="spec-list">
              {product.specifications.map((spec) => (
                <div className="spec-row" key={spec.label}>
                  <dt>{spec.label}</dt>
                  <dd>{spec.value}</dd>
                </div>
              ))}
            </dl>
          </section>

          {product.documents ? (
            <section className="panel">
              <h2>Documents</h2>
              <div className="document-list">
                {product.documents.map((document) => (
                  <a className="button secondary" href={document.url} key={document.label}>
                    {document.label}
                  </a>
                ))}
              </div>
            </section>
          ) : null}
        </aside>
      </section>
    </main>
  );
}

const productTypeLabel = {
  hmi: "HMI display",
  "data-logger": "Data logging",
  module: "Control module",
};
