import Link from "next/link";

import { ArticleForm } from "@/components/studio/article-form";
import { getProducts } from "@/lib/managed-data";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "New Article | Eltronic Studio",
};

export default async function NewArticlePage() {
  const products = await getProducts();

  return (
    <div className="grid gap-6">
      <section className="studio-page-header">
        <p>Create a News/Blog article for technical notes, company updates or product guidance.</p>
        <Link href="/studio/articles">Back to articles</Link>
      </section>
      <ArticleForm products={products} returnTo="/studio/articles" />
    </div>
  );
}
