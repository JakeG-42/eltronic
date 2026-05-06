import { ArticleCard } from "@/components/site/article-card";
import { getArticles } from "@/lib/managed-data";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Articles",
  description:
    "Eltronic articles on CAN-Bus, telematics, HMI systems, cloud integration, mobile machinery and connected platforms.",
  path: "/articles",
});

export const dynamic = "force-dynamic";

export default async function ArticlesPage() {
  const articles = await getArticles();
  const categories = Array.from(new Set(articles.map((article) => article.category))).sort((a, b) => a.localeCompare(b));

  return (
    <main className="page">
      <section className="hero compact-hero article-index-hero">
        <div className="hero-copy">
          <p className="code-kicker">articles.index</p>
          <h1>News, technical notes and field thinking.</h1>
          <p className="lede">
            Practical explanations around the systems Eltronic builds and integrates: CAN-Bus, HMI, telematics,
            cloud dashboards, safety and connected machinery.
          </p>
        </div>
        <div className="article-index-panel">
          <span className="section-number">library.summary</span>
          <strong>{articles.length}</strong>
          <p>Imported and editable articles from Eltronic Studio.</p>
          <div className="tag-row">
            {categories.slice(0, 6).map((category) => (
              <span className="tag" key={category}>
                {category}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <div>
            <span className="section-number">articles.feed</span>
            <h2>Article library</h2>
          </div>
          <p>Use these articles as a practical reference point for products, demonstrations and customer discussions.</p>
        </div>

        <div className="article-grid">
          {articles.map((article) => (
            <ArticleCard article={article} key={article.slug} />
          ))}
        </div>
      </section>
    </main>
  );
}
