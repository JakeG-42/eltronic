import Link from "next/link";

import type { Article } from "@/content/articles";

type ArticleCardProps = {
  article: Article;
  compact?: boolean;
};

export function ArticleCard({ article, compact = false }: ArticleCardProps) {
  return (
    <Link className={compact ? "article-card compact" : "article-card"} href={`/articles/${article.slug}`}>
      <span className="section-number">{article.category}</span>
      <h3>{article.title}</h3>
      <p>{article.excerpt}</p>
      <div className="tag-row">
        {(article.tags ?? []).slice(0, compact ? 2 : 4).map((tag) => (
          <span className="tag" key={tag}>
            {tag}
          </span>
        ))}
      </div>
    </Link>
  );
}
