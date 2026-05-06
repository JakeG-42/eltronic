import Link from "next/link";
import type { ReactNode } from "react";
import { Boxes, Database, FileCode2, Inbox, LayoutTemplate, Newspaper, Paintbrush, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { productTemplateDefinitions, productTemplateLabels } from "@/content/products";
import { getArticles, getProducts, getStorageMode, getSubmissions } from "@/lib/managed-data";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Studio | Eltronic",
};

export default async function StudioDashboardPage() {
  const [products, submissions, articles] = await Promise.all([getProducts(), getSubmissions(), getArticles({ includeDrafts: true })]);
  const newSubmissions = submissions.filter((submission) => submission.status === "new");
  const activeTemplateCount = new Set(products.map((product) => product.template)).size || productTemplateDefinitions.length;

  return (
    <div className="grid gap-6">
      <section className="studio-page-header">
        <p>A clean control room for product content, product templates, ordered galleries and quote enquiries.</p>
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/studio/products/new">
              <Plus className="size-4" />
              Add product
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/studio/products">Manage products</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/studio/articles">Manage articles</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/studio/builder">
              <Paintbrush className="size-4" />
              Website builder
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/studio/templates">
              <FileCode2 className="size-4" />
              Code Studio
            </Link>
          </Button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-5">
        <MetricCard icon={<Boxes className="size-5" />} label="Products" value={products.length.toString()} />
        <MetricCard icon={<Newspaper className="size-5" />} label="Articles" value={articles.length.toString()} />
        <MetricCard icon={<LayoutTemplate className="size-5" />} label="Templates" value={activeTemplateCount.toString()} compact />
        <MetricCard icon={<Inbox className="size-5" />} label="New enquiries" value={newSubmissions.length.toString()} />
        <MetricCard icon={<Database className="size-5" />} label="Storage" value={getStorageMode()} compact />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent products</CardTitle>
            <CardDescription>Jump straight into full edit or quick editing from the product table.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {products.slice(0, 5).map((product) => (
              <Link className="studio-list-row" href={`/studio/products?quick=${product.slug}`} key={product.slug}>
                <span>
                  <strong>{product.name}</strong>
                  <small>{product.family}</small>
                </span>
                <span>{productTemplateLabels[product.template]}</span>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent enquiries</CardTitle>
            <CardDescription>Contact form submissions from the public website.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {submissions.length === 0 ? (
              <p className="mb-0 text-sm text-muted-foreground">No submissions yet.</p>
            ) : null}
            {submissions.slice(0, 5).map((submission) => (
              <Link className="studio-list-row" href="/studio/submissions" key={submission.id}>
                <span>
                  <strong>{submission.name}</strong>
                  <small>{submission.email}</small>
                </span>
                <span>{submission.status}</span>
              </Link>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function MetricCard({
  compact = false,
  icon,
  label,
  value,
}: {
  compact?: boolean;
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/12 text-primary">
          {icon}
        </div>
        <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-[0.22em] text-muted-foreground">{label}</p>
          <strong className={compact ? "text-sm text-foreground" : "font-mono text-3xl text-foreground"}>
            {value}
          </strong>
        </div>
      </CardContent>
    </Card>
  );
}
