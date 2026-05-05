import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { TechnicalVisual } from "@/components/site/technical-visuals";
import type { Document as PayloadDocument, Media, Page, Product } from "@/payload-types";

type PageBlock = Page["layout"][number];
type LinkFields = {
  label?: string | null;
  url?: string | null;
};
type DesignFields = {
  alignment?: "center" | "left" | null;
  backgroundStyle?: "contrast" | "default" | "panel" | "soft" | null;
  columns?: "2" | "3" | "4" | null;
  spacing?: "compact" | "normal" | "spacious" | null;
};
type LexicalNode = {
  children?: LexicalNode[];
  fields?: {
    url?: string | null;
  };
  format?: number | string;
  listType?: string;
  tag?: string;
  text?: string;
  type?: string;
  url?: string | null;
};
type LexicalContent = {
  root?: LexicalNode;
};

function isDocument<T extends { id: number }>(value: number | T | null | undefined): value is T {
  return typeof value === "object" && value !== null;
}

function isMediaWithUrl(value: number | Media | null | undefined): value is Media & { url: string } {
  return isDocument(value) && Boolean(value.url);
}

function getMediaUrl(media: number | Media | null | undefined) {
  if (!isDocument(media)) {
    return null;
  }

  return media.url ?? null;
}

function getMediaAlt(media: number | Media | null | undefined, fallback: string) {
  if (!isDocument(media)) {
    return fallback;
  }

  return media.alt || fallback;
}

function renderCmsLink(link: LinkFields | null | undefined, className = "button") {
  if (!link?.label || !link.url) {
    return null;
  }

  if (/^https?:\/\//i.test(link.url)) {
    return (
      <a className={className} href={link.url} rel="noreferrer" target="_blank">
        {link.label}
      </a>
    );
  }

  return (
    <Link className={className} href={link.url}>
      {link.label}
    </Link>
  );
}

function CmsMedia({
  alt,
  className = "payload-media-frame",
  media,
}: {
  alt: string;
  className?: string;
  media: number | Media | null | undefined;
}) {
  const src = getMediaUrl(media);

  if (!src) {
    return <TechnicalVisual label={alt} variant="network" />;
  }

  return (
    <figure className={className}>
      <Image alt={getMediaAlt(media, alt)} fill sizes="(max-width: 900px) 100vw, 48vw" src={src} />
    </figure>
  );
}

function renderLexicalChildren(children: LexicalNode[] | undefined): ReactNode[] {
  return (children ?? []).map((child, index) => renderLexicalNode(child, index));
}

function renderTextNode(node: LexicalNode, index: number) {
  const format = typeof node.format === "number" ? node.format : 0;
  let content: ReactNode = node.text ?? "";

  if (format & 1) {
    content = <strong>{content}</strong>;
  }

  if (format & 2) {
    content = <em>{content}</em>;
  }

  if (format & 8) {
    content = <span className="payload-text-underline">{content}</span>;
  }

  if (format & 16) {
    content = <code>{content}</code>;
  }

  return <span key={index}>{content}</span>;
}

function renderLexicalNode(node: LexicalNode, index: number): ReactNode {
  if (node.type === "text") {
    return renderTextNode(node, index);
  }

  if (node.type === "linebreak") {
    return <br key={index} />;
  }

  if (node.type === "heading") {
    const Tag = node.tag === "h3" ? "h3" : "h2";

    return <Tag key={index}>{renderLexicalChildren(node.children)}</Tag>;
  }

  if (node.type === "list") {
    const ListTag = node.listType === "number" ? "ol" : "ul";

    return <ListTag key={index}>{renderLexicalChildren(node.children)}</ListTag>;
  }

  if (node.type === "listitem") {
    return <li key={index}>{renderLexicalChildren(node.children)}</li>;
  }

  if (node.type === "quote") {
    return <blockquote key={index}>{renderLexicalChildren(node.children)}</blockquote>;
  }

  if (node.type === "link") {
    const url = node.url ?? node.fields?.url;

    if (!url) {
      return <span key={index}>{renderLexicalChildren(node.children)}</span>;
    }

    return (
      <a href={url} key={index}>
        {renderLexicalChildren(node.children)}
      </a>
    );
  }

  if (node.type === "root") {
    return <>{renderLexicalChildren(node.children)}</>;
  }

  return <p key={index}>{renderLexicalChildren(node.children)}</p>;
}

function RichText({ content }: { content: LexicalContent }) {
  return <div className="payload-rich-text">{renderLexicalChildren(content.root?.children)}</div>;
}

function productCategoryLabel(product: Product) {
  return isDocument(product.category) ? product.category.name : product.template;
}

function getDesign(block: PageBlock): Required<Omit<DesignFields, "columns">> & { columns: "2" | "3" | "4" } {
  const design = block as PageBlock & DesignFields;

  return {
    alignment: design.alignment ?? "left",
    backgroundStyle: design.backgroundStyle ?? "default",
    columns: design.columns ?? "3",
    spacing: design.spacing ?? "normal",
  };
}

function getSectionClassName(block: PageBlock, className = "section") {
  const design = getDesign(block);

  return [
    className,
    "payload-section",
    `payload-bg-${design.backgroundStyle}`,
    `payload-spacing-${design.spacing}`,
    `payload-align-${design.alignment}`,
  ].join(" ");
}

function getColumnsClassName(block: PageBlock, className: string) {
  return `${className} payload-columns-${getDesign(block).columns}`;
}

function ProductCard({ product }: { product: Product }) {
  const media = product.gallery?.find(isMediaWithUrl);

  return (
    <a className="product-card" href={`https://eltronic.co.uk/products/${product.slug}`}>
      {media ? (
        <div className="product-media">
          <Image
            alt={media.alt || product.name}
            fill
            sizes="(max-width: 680px) 100vw, (max-width: 980px) 50vw, 33vw"
            src={media.url}
          />
        </div>
      ) : (
        <div className="payload-product-placeholder">
          <span>{product.family}</span>
        </div>
      )}
      <div className="product-content">
        <div className="tag-row">
          <span className="tag">{product.family}</span>
          <span className="tag warning">{productCategoryLabel(product)}</span>
        </div>
        <h3>{product.name}</h3>
        <p>{product.summary}</p>
      </div>
    </a>
  );
}

function renderBlock(block: PageBlock, featuredProducts: Product[], index: number) {
  const key = `${block.blockType}-${block.id ?? index}`;

  if (block.blockType === "hero") {
    return (
      <section className={getSectionClassName(block, "hero payload-hero")} key={key}>
        <div className="hero-copy">
          {block.eyebrow ? <p className="code-kicker">{block.eyebrow}</p> : null}
          <h1 className="hero-title">
            <span className="title-value gradient-text">{block.heading}</span>
          </h1>
          {block.lede ? <p className="lede">{block.lede}</p> : null}
          <div className="actions">
            {renderCmsLink(block.primaryLink)}
            {renderCmsLink(block.secondaryLink, "button secondary")}
          </div>
        </div>
        <CmsMedia alt={block.heading} media={block.image} />
      </section>
    );
  }

  if (block.blockType === "richText") {
    return (
      <section className={getSectionClassName(block, "section payload-copy-section")} key={key}>
        <RichText content={block.content} />
      </section>
    );
  }

  if (block.blockType === "imageText") {
    return (
      <section className={getSectionClassName(block)} key={key}>
        <div className={`split-module ${block.imageSide === "right" ? "reverse" : ""}`}>
          <CmsMedia alt={block.heading} media={block.image} />
          <div>
            <span className="section-number">feature.detail</span>
            <h2>{block.heading}</h2>
            {block.body ? <p className="lede">{block.body}</p> : null}
            <div className="actions">{renderCmsLink(block.link, "button secondary")}</div>
          </div>
        </div>
      </section>
    );
  }

  if (block.blockType === "cardGrid") {
    return (
      <section className={getSectionClassName(block)} key={key}>
        <div className="section-heading">
          <div>
            <span className="section-number">content.grid</span>
            <h2>{block.heading}</h2>
          </div>
          {block.intro ? <p>{block.intro}</p> : null}
        </div>
        <div className={getColumnsClassName(block, "capability-grid payload-card-grid")}>
          {(block.cards ?? []).map((card) => (
            <article className="capability-card panel" key={card.id ?? card.title}>
              <h3>{card.title}</h3>
              {card.body ? <p>{card.body}</p> : null}
              <div className="actions">{renderCmsLink(card.link, "button secondary")}</div>
            </article>
          ))}
        </div>
      </section>
    );
  }

  if (block.blockType === "productGrid") {
    const manualProducts = (block.products ?? []).filter((product): product is Product => isDocument(product));
    const products = block.mode === "manual" ? manualProducts : featuredProducts;

    return (
      <section className={getSectionClassName(block)} key={key}>
        <div className="section-heading">
          <div>
            <span className="section-number">product.range</span>
            <h2>{block.heading}</h2>
          </div>
          {block.intro ? <p>{block.intro}</p> : null}
        </div>
        {products.length ? (
          <div className={getColumnsClassName(block, "product-grid")}>
            {products.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        ) : (
          <div className="panel payload-empty-block">
            <p>Add featured products in Console to populate this section.</p>
          </div>
        )}
      </section>
    );
  }

  if (block.blockType === "gallery") {
    const images = block.images.filter((image): image is Media => isDocument(image));

    return (
      <section className={getSectionClassName(block)} key={key}>
        {block.heading ? (
          <div className="section-heading">
            <div>
              <span className="section-number">media.gallery</span>
              <h2>{block.heading}</h2>
            </div>
          </div>
        ) : null}
        <div className={getColumnsClassName(block, "payload-gallery-grid")}>
          {images.map((image) => (
            <CmsMedia alt={image.alt} className="payload-gallery-item" key={image.id} media={image} />
          ))}
        </div>
      </section>
    );
  }

  if (block.blockType === "downloads") {
    const documents = (block.documents ?? []).filter((document): document is PayloadDocument => isDocument(document));

    return (
      <section className={getSectionClassName(block)} key={key}>
        <div className="section-heading">
          <div>
            <span className="section-number">resource.downloads</span>
            <h2>{block.heading}</h2>
          </div>
        </div>
        <div className={getColumnsClassName(block, "document-grid")}>
          {documents.map((document) => (
            <a className="document-card" href={document.url ?? "#"} key={document.id}>
              <span>{document.mimeType ?? "Document"}</span>
              <strong>{document.title}</strong>
              {document.description ? <small>{document.description}</small> : null}
            </a>
          ))}
        </div>
      </section>
    );
  }

  if (block.blockType === "specTable") {
    return (
      <section className={getSectionClassName(block, "section payload-spec-section")} key={key}>
        <div className="section-heading">
          <div>
            <span className="section-number">technical.data</span>
            <h2>{block.heading}</h2>
          </div>
        </div>
        <dl className="payload-spec-table">
          {(block.rows ?? []).map((row) => (
            <div key={row.id ?? row.label}>
              <dt>{row.label}</dt>
              <dd>{row.value}</dd>
            </div>
          ))}
        </dl>
      </section>
    );
  }

  if (block.blockType === "callToAction") {
    return (
      <section className={getSectionClassName(block)} key={key}>
        <div className="cta-module payload-cta">
          <div>
            {block.eyebrow ? <span className="section-number">{block.eyebrow}</span> : null}
            <h2>{block.heading}</h2>
            {block.body ? <p>{block.body}</p> : null}
          </div>
          {renderCmsLink(block.primaryLink)}
        </div>
      </section>
    );
  }

  return null;
}

export function PayloadPageRenderer({ featuredProducts, page }: { featuredProducts: Product[]; page: Page }) {
  return (
    <main className="page payload-page">
      {page.layout.map((block, index) => renderBlock(block, featuredProducts, index))}
    </main>
  );
}
