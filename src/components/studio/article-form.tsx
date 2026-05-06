import { FileText, ShieldCheck } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { saveArticleAction } from "@/app/studio/actions";
import type { Article } from "@/content/articles";
import type { Product } from "@/content/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const inputGridClass = "grid gap-2";

export function ArticleForm({
  article,
  products,
  returnTo = "/studio/articles",
  submitLabel,
}: {
  article?: Article;
  products: Product[];
  returnTo?: string;
  submitLabel?: string;
}) {
  const formId = article?.slug ?? "new-article";
  const selectedProducts = new Set(article?.relatedProductSlugs ?? []);
  const submitText = submitLabel ?? (article ? "Save article" : "Create article");

  return (
    <form action={saveArticleAction} className="studio-product-editor">
      <input name="previousSlug" type="hidden" value={article?.slug ?? ""} />
      <input name="returnTo" type="hidden" value={returnTo} />

      <div className="studio-editor-main">
        <ArticleFormSection
          eyebrow="article.data"
          title="Article data"
          description="Core fields used for the public article page, article cards and search snippets."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className={inputGridClass}>
              <Label htmlFor={`${formId}-title`}>Title</Label>
              <Input id={`${formId}-title`} name="title" defaultValue={article?.title} required />
            </div>
            <div className={inputGridClass}>
              <Label htmlFor={`${formId}-slug`}>Slug</Label>
              <Input id={`${formId}-slug`} name="slug" defaultValue={article?.slug} placeholder="auto-generated if blank" />
            </div>
            <div className={inputGridClass}>
              <Label htmlFor={`${formId}-category`}>Category</Label>
              <Input id={`${formId}-category`} name="category" defaultValue={article?.category} placeholder="Telematics" />
            </div>
            <div className={inputGridClass}>
              <Label htmlFor={`${formId}-published-at`}>Published date</Label>
              <Input
                id={`${formId}-published-at`}
                name="publishedAt"
                type="datetime-local"
                defaultValue={dateTimeLocalValue(article?.publishedAt)}
              />
            </div>
            <div className={inputGridClass}>
              <Label htmlFor={`${formId}-author`}>Author</Label>
              <Input id={`${formId}-author`} name="author" defaultValue={article?.author ?? "Eltronic"} />
            </div>
            <div className={inputGridClass}>
              <Label htmlFor={`${formId}-status`}>Status</Label>
              <select
                className="flex h-10 w-full rounded-xl border border-input bg-background/60 px-3 py-2 text-sm text-foreground shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                defaultValue={article?.status ?? "draft"}
                id={`${formId}-status`}
                name="status"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>
        </ArticleFormSection>

        <ArticleFormSection
          eyebrow="article.copy"
          title="Summary and body"
          description="Body supports simple Markdown headings, bullet lists and paragraphs."
        >
          <div className={inputGridClass}>
            <Label htmlFor={`${formId}-excerpt`}>Summary</Label>
            <Textarea id={`${formId}-excerpt`} name="excerpt" defaultValue={article?.excerpt} required />
          </div>
          <div className={inputGridClass}>
            <Label htmlFor={`${formId}-body`}>Body</Label>
            <Textarea className="min-h-[34rem]" id={`${formId}-body`} name="body" defaultValue={article?.body} required />
            <p className="studio-field-hint">
              Use <code>## Heading</code>, <code>- bullet</code> and normal paragraphs. The public page renders it
              safely without raw HTML.
            </p>
          </div>
        </ArticleFormSection>

        <ArticleFormSection
          eyebrow="article.links"
          title="References and media"
          description="Optional source file, hero image and product references."
          defaultOpen={false}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className={inputGridClass}>
              <Label htmlFor={`${formId}-hero-image`}>Hero image URL</Label>
              <Input id={`${formId}-hero-image`} name="heroImage" defaultValue={article?.heroImage} placeholder="/media/articles/..." />
            </div>
            <div className={inputGridClass}>
              <Label htmlFor={`${formId}-source-url`}>Source file URL</Label>
              <Input id={`${formId}-source-url`} name="sourceFileUrl" defaultValue={article?.sourceFileUrl} />
            </div>
            <div className={inputGridClass}>
              <Label htmlFor={`${formId}-source-name`}>Source filename</Label>
              <Input id={`${formId}-source-name`} name="sourceFileName" defaultValue={article?.sourceFileName} />
            </div>
            <div className={inputGridClass}>
              <Label htmlFor={`${formId}-tags`}>Tags</Label>
              <Input id={`${formId}-tags`} name="tags" defaultValue={article?.tags?.join(", ")} placeholder="CAN-Bus, HMI, AutoPi" />
            </div>
          </div>

          <div className={inputGridClass}>
            <Label>Related products</Label>
            <div className="studio-related-product-grid">
              {products.map((product) => (
                <label className="studio-module-toggle" key={product.slug}>
                  <input
                    defaultChecked={selectedProducts.has(product.slug)}
                    name="relatedProductSlugs"
                    type="checkbox"
                    value={product.slug}
                  />
                  <span>
                    <strong>{product.name}</strong>
                    <small>{product.family}</small>
                  </span>
                </label>
              ))}
            </div>
          </div>
        </ArticleFormSection>
      </div>

      <aside className="studio-editor-sidebar" aria-label="Article publish and management panels">
        <section className="studio-editor-panel studio-publish-panel">
          <span className="studio-eyebrow">publish</span>
          <h2>{article ? "Save article" : "Create article"}</h2>
          <p>Articles feed the public blog/news area, homepage cards and product-page references.</p>
          <dl className="studio-editor-summary">
            <div>
              <dt>Status</dt>
              <dd>{article?.status ?? "Draft"}</dd>
            </div>
            <div>
              <dt>Homepage</dt>
              <dd>{article?.homepageFeatured ? "Featured" : "Not featured"}</dd>
            </div>
            <div>
              <dt>Products</dt>
              <dd>{selectedProducts.size} linked</dd>
            </div>
          </dl>
          <div className="studio-form-actions">
            <Button className="w-full" type="submit">
              <ShieldCheck className="size-4" />
              {submitText}
            </Button>
          </div>
        </section>

        <ArticleFormSection
          eyebrow="article.visibility"
          title="Visibility"
          description="Choose how this article is promoted."
        >
          <div className="studio-module-grid">
            <label className="studio-module-toggle">
              <input defaultChecked={article?.featured ?? false} name="featured" type="checkbox" />
              <span>
                <strong>Featured</strong>
                <small>Mark as an important article.</small>
              </span>
            </label>
            <label className="studio-module-toggle">
              <input defaultChecked={article?.homepageFeatured ?? false} name="homepageFeatured" type="checkbox" />
              <span>
                <strong>Homepage</strong>
                <small>Show in homepage article cards.</small>
              </span>
            </label>
          </div>
        </ArticleFormSection>

        {article?.sourceFileUrl ? (
          <section className="studio-editor-panel">
            <span className="studio-eyebrow">source.file</span>
            <h2>Original document</h2>
            <p>{article.sourceFileName ?? "Imported source file"}</p>
            <Button asChild className="w-full" variant="outline">
              <Link href={article.sourceFileUrl} target="_blank">
                <FileText className="size-4" />
                Open source
              </Link>
            </Button>
          </section>
        ) : null}
      </aside>
    </form>
  );
}

function ArticleFormSection({
  children,
  defaultOpen = true,
  description,
  eyebrow,
  title,
}: {
  children: ReactNode;
  defaultOpen?: boolean;
  description: string;
  eyebrow: string;
  title: string;
}) {
  return (
    <details className="studio-form-section studio-form-disclosure" open={defaultOpen}>
      <summary className="studio-form-section-summary">
        <span>
          <span className="studio-eyebrow">{eyebrow}</span>
          <strong>{title}</strong>
          <small>{description}</small>
        </span>
        <span className="studio-disclosure-state">Show / hide</span>
      </summary>
      <div className="studio-form-section-body">{children}</div>
    </details>
  );
}

function dateTimeLocalValue(value?: string) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().slice(0, 16);
}
