import { Edit3, FileText, Plus, Trash2 } from "lucide-react";
import Link from "next/link";

import { deleteArticleAction } from "@/app/studio/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getArticles } from "@/lib/managed-data";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Articles | Eltronic Studio",
};

export default async function StudioArticlesPage() {
  const articles = await getArticles({ includeDrafts: true });
  const publishedCount = articles.filter((article) => article.status === "published").length;
  const homepageCount = articles.filter((article) => article.homepageFeatured).length;

  return (
    <div className="grid gap-6">
      <section className="studio-page-header">
        <p>Manage News/Blog articles, technical explanations and source documents. Published articles appear on the public site.</p>
        <Button asChild>
          <Link href="/studio/articles/new">
            <Plus className="size-4" />
            New article
          </Link>
        </Button>
      </section>

      <div className="studio-media-stats" aria-label="Article totals">
        <span>
          <strong>{articles.length}</strong>
          articles
        </span>
        <span>
          <strong>{publishedCount}</strong>
          published
        </span>
        <span>
          <strong>{homepageCount}</strong>
          homepage
        </span>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Article library</CardTitle>
          <CardDescription>Imported DOCX content can now be edited, categorised and linked to products.</CardDescription>
        </CardHeader>
        <CardContent>
          {articles.length === 0 ? (
            <p className="mb-0 text-sm text-muted-foreground">No articles have been added yet.</p>
          ) : (
            <div className="studio-media-table-wrap">
              <table className="studio-media-table studio-article-table">
                <thead>
                  <tr>
                    <th>Article</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Products</th>
                    <th>Published</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {articles.map((article) => (
                    <tr key={article.slug}>
                      <td>
                        <strong className="studio-media-table-source">{article.title}</strong>
                        <small className="studio-article-row-summary">{article.excerpt}</small>
                      </td>
                      <td>{article.category}</td>
                      <td>{article.status}</td>
                      <td>{article.relatedProductSlugs?.length ?? 0}</td>
                      <td>{formatDate(article.publishedAt)}</td>
                      <td>
                        <div className="studio-table-actions">
                          <Button asChild size="sm" variant="outline">
                            <Link href={`/studio/articles/${article.slug}/edit`}>
                              <Edit3 className="size-4" />
                              Edit
                            </Link>
                          </Button>
                          {article.status === "published" ? (
                            <Button asChild size="sm" variant="ghost">
                              <Link href={`/articles/${article.slug}`} target="_blank">
                                <FileText className="size-4" />
                                View
                              </Link>
                            </Button>
                          ) : null}
                          <form action={deleteArticleAction}>
                            <input name="slug" type="hidden" value={article.slug} />
                            <input name="returnTo" type="hidden" value="/studio/articles" />
                            <Button size="sm" type="submit" variant="destructive">
                              <Trash2 className="size-4" />
                              Delete
                            </Button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}
