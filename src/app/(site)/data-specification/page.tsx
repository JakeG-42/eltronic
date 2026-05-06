import Link from "next/link";
import { ManagedImage } from "@/components/site/managed-image";
import { TechnicalVisual } from "@/components/site/technical-visuals";
import { resourceModules } from "@/content/site";
import type { Product, ProductDocument } from "@/content/products";
import { getProducts } from "@/lib/managed-data";
import { createPageMetadata } from "@/lib/seo";

type DocumentTypeKey = "datasheet" | "full-datasheet" | "manual" | "other" | "simple-data";

type DocumentTypeTag = {
  key: DocumentTypeKey;
  label: string;
};

type TaggedDocument = ProductDocument & {
  destination: string;
  typeTag: DocumentTypeTag;
};

type ProductDocumentGroup = {
  documents: TaggedDocument[];
  product: Product;
};

export const metadata = createPageMetadata({
  title: "Data & Specification",
  description:
    "Product data sheets, guides, specification resources and enquiry support for Eltronic products.",
  path: "/data-specification",
});

export const dynamic = "force-dynamic";

export default async function DataSpecificationPage() {
  const products = await getProducts();
  const documentGroups = getProductDocumentGroups(products);
  const documentCount = documentGroups.reduce((total, group) => total + group.documents.length, 0);
  const productCount = documentGroups.length;

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
            <h2>Product document library</h2>
          </div>
          <p>
            Product files are grouped by catalogue item, with a product tag and
            a document type tag so data sheets, manuals and specification notes
            are easier to scan.
          </p>
        </div>
        <div className="document-summary-strip" aria-label="Document library totals">
          <span>
            <strong>{documentCount}</strong>
            documents
          </span>
          <span>
            <strong>{productCount}</strong>
            products
          </span>
          <span>
            <strong>{countDocumentsByType(documentGroups, "manual")}</strong>
            manuals
          </span>
          <span>
            <strong>{countDocumentsByType(documentGroups, "full-datasheet")}</strong>
            full data sheets
          </span>
        </div>

        {documentGroups.length === 0 ? (
          <div className="document-grid">
            <article className="panel">
              <h3>No documents attached yet</h3>
              <p>Technical documents can be requested with a product enquiry.</p>
            </article>
          </div>
        ) : null}

        <div className="product-document-list">
          {documentGroups.map(({ documents, product }) => (
            <article className="product-document-group" key={product.slug}>
              <div className="product-document-header">
                <div className="product-document-media">
                  <ManagedImage
                    alt={product.image.alt}
                    fill
                    sizes="(max-width: 680px) 72px, 96px"
                    src={product.image.src}
                  />
                </div>
                <div className="product-document-intro">
                  <span className="document-tag product-tag">Product tag: {product.name}</span>
                  <h3>{product.name}</h3>
                  <p>{product.summary}</p>
                  <div className="document-tag-row">
                    <span>{product.family}</span>
                    <span>{product.category}</span>
                    <span>
                      {documents.length} file{documents.length === 1 ? "" : "s"}
                    </span>
                  </div>
                </div>
                <Link className="document-product-link" href={`/products/${product.slug}`}>
                  Product page
                </Link>
              </div>

              <div className="product-document-files">
                {documents.map((document) => (
                  <a
                    className="product-document-file"
                    href={document.url}
                    key={`${product.slug}-${document.label}-${document.url}`}
                    rel="noreferrer"
                    target={document.url.startsWith("/contact") ? undefined : "_blank"}
                  >
                    <span className={`document-tag type-tag type-tag-${document.typeTag.key}`}>
                      Type tag: {document.typeTag.label}
                    </span>
                    <strong>{document.label}</strong>
                    <small>{document.destination}</small>
                  </a>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

function getProductDocumentGroups(products: Product[]): ProductDocumentGroup[] {
  return products
    .map((product) => ({
      product,
      documents: (product.documents ?? []).map((document) => ({
        ...document,
        destination: formatDocumentDestination(document.url),
        typeTag: inferDocumentType(document),
      })),
    }))
    .filter((group) => group.documents.length > 0)
    .sort((a, b) => {
      const familyCompare = a.product.family.localeCompare(b.product.family);
      return familyCompare === 0 ? a.product.name.localeCompare(b.product.name) : familyCompare;
    });
}

function countDocumentsByType(groups: ProductDocumentGroup[], type: DocumentTypeKey) {
  return groups.reduce(
    (total, group) => total + group.documents.filter((document) => document.typeTag.key === type).length,
    0,
  );
}

function inferDocumentType(document: ProductDocument): DocumentTypeTag {
  const source = `${document.label} ${document.url}`.toLowerCase();

  if (source.includes("operating manual") || source.includes("manual") || /\/ba[_-]/i.test(document.url)) {
    return { key: "manual", label: "Operating manual" };
  }

  if (source.includes("full") || /[_-]f(?:\.pdf|$)/i.test(document.url)) {
    return { key: "full-datasheet", label: "Full datasheet" };
  }

  if (source.includes("basic") || source.includes("simple") || /[_-]b(?:\.pdf|$)/i.test(document.url)) {
    return { key: "simple-data", label: "Simple data" };
  }

  if (source.includes("data") || source.includes("tds") || source.includes("datasheet")) {
    return { key: "datasheet", label: "Datasheet" };
  }

  return { key: "other", label: "Product document" };
}

function formatDocumentDestination(url: string) {
  if (url.startsWith("/contact")) {
    return "Available on request";
  }

  if (url.startsWith("/")) {
    const fileName = decodeURIComponent(url.split("/").filter(Boolean).at(-1) ?? "local file");
    return `Local PDF - ${fileName.replace(/_/g, " ")}`;
  }

  try {
    return new URL(url).hostname;
  } catch {
    return "Product resource";
  }
}
