import Link from "next/link";
import { notFound } from "next/navigation";

import { ArticleMarkdown } from "@/components/site/article-markdown";
import { StructuredData } from "@/components/site/structured-data";
import { getArticleBySlug, getProducts } from "@/lib/managed-data";
import { absoluteUrl, breadcrumbJsonLd, createPageMetadata, siteConfig } from "@/lib/seo";

type ArticlePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    return {};
  }

  return createPageMetadata({
    title: article.title,
    description: article.excerpt,
    path: `/articles/${article.slug}`,
  });
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const [article, products] = await Promise.all([getArticleBySlug(slug), getProducts()]);

  if (!article) {
    notFound();
  }

  const relatedProducts = products.filter((product) => article.relatedProductSlugs?.includes(product.slug));

  return (
    <main className="page article-detail-page">
      <StructuredData
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Articles", path: "/articles" },
            { name: article.title, path: `/articles/${article.slug}` },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "Article",
            author: {
              "@type": "Organization",
              name: article.author || siteConfig.name,
            },
            dateModified: article.updatedAt ?? article.publishedAt,
            datePublished: article.publishedAt,
            description: article.excerpt,
            headline: article.title,
            mainEntityOfPage: absoluteUrl(`/articles/${article.slug}`),
            publisher: {
              "@type": "Organization",
              name: siteConfig.name,
            },
          },
        ]}
      />
      <article>
        <header className="article-hero">
          <Link className="section-number" href="/articles">
            articles.index
          </Link>
          <h1>{article.title}</h1>
          <p className="lede">{article.excerpt}</p>
          <div className="tag-row">
            <span className="tag warning">{article.category}</span>
            <span className="tag">{formatDate(article.publishedAt)}</span>
            {(article.tags ?? []).slice(0, 4).map((tag) => (
              <span className="tag" key={tag}>
                {tag}
              </span>
            ))}
          </div>
        </header>

        <div className="article-layout">
          <ArticleMarkdown content={article.body} />

          <aside className="article-side-panel">
            <div className="panel">
              <span className="section-number">article.meta</span>
              <h2>Article details</h2>
              <p>{article.category}</p>
              {article.sourceFileUrl ? (
                <a className="button secondary" href={article.sourceFileUrl}>
                  Source DOCX
                </a>
              ) : null}
            </div>

            {relatedProducts.length > 0 ? (
              <div className="panel">
                <span className="section-number">linked.products</span>
                <h2>Referenced products</h2>
                <div className="article-linked-list">
                  {relatedProducts.map((product) => (
                    <Link href={`/products/${product.slug}`} key={product.slug}>
                      <strong>{product.name}</strong>
                      <small>{product.family}</small>
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
          </aside>
        </div>
      </article>
    </main>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}
