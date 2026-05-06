import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductMediaGallery } from "@/components/site/product-media-gallery";
import { StructuredData } from "@/components/site/structured-data";
import { getProductBySlug, getProductImages } from "@/lib/managed-data";
import { absoluteUrl, breadcrumbJsonLd, createPageMetadata, siteConfig } from "@/lib/seo";

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

  return createPageMetadata({
    title: product.name,
    description: product.summary,
    path: `/products/${product.slug}`,
  });
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
      <StructuredData
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Products", path: "/products" },
            { name: product.name, path: `/products/${product.slug}` },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "Product",
            brand: {
              "@type": "Brand",
              name: siteConfig.name,
            },
            category: product.category,
            description: product.summary,
            image: images.map((image) => schemaImageUrl(image.src)).filter((src): src is string => Boolean(src)),
            name: product.name,
            sku: product.sku,
            url: absoluteUrl(`/products/${product.slug}`),
          },
        ]}
      />
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

      <section className="detail-layout product-detail-layout">
        <section className="panel detail-section-full">
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

        <section className="panel detail-section-full">
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
      </section>
    </main>
  );
}

const productTypeLabel = {
  default: "Default",
};

function schemaImageUrl(src: string) {
  if (/^(data|blob):/i.test(src)) {
    return null;
  }

  return absoluteUrl(src);
}
