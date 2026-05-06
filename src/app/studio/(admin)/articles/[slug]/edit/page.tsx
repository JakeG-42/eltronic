import Link from "next/link";
import { notFound } from "next/navigation";

import { ArticleForm } from "@/components/studio/article-form";
import { getArticleBySlug, getProducts } from "@/lib/managed-data";

type EditArticlePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: EditArticlePageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug, { includeDrafts: true });

  return {
    title: article ? `Edit ${article.title} | Eltronic Studio` : "Edit Article | Eltronic Studio",
  };
}

export default async function EditArticlePage({ params }: EditArticlePageProps) {
  const { slug } = await params;
  const [article, products] = await Promise.all([getArticleBySlug(slug, { includeDrafts: true }), getProducts()]);

  if (!article) {
    notFound();
  }

  return (
    <div className="grid gap-6">
      <section className="studio-page-header">
        <p>Edit article copy, source file links, promotion flags and related products.</p>
        <div className="flex flex-wrap gap-2">
          <Link href="/studio/articles">Back to articles</Link>
          {article.status === "published" ? (
            <Link href={`/articles/${article.slug}`} target="_blank">
              View public article
            </Link>
          ) : null}
        </div>
      </section>
      <ArticleForm article={article} products={products} returnTo={`/studio/articles/${article.slug}/edit`} />
    </div>
  );
}
