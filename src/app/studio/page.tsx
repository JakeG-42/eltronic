import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import {
  Boxes,
  Database,
  FilePenLine,
  Inbox,
  LayoutTemplate,
  LogOut,
  Mail,
  Plus,
  ShieldCheck,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import type { Product } from "@/content/products";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  getProductFamilies,
  getProducts,
  getStorageMode,
  getSubmissions,
  hasPersistentStorage,
  type ContactSubmission,
  type ContactSubmissionStatus,
} from "@/lib/managed-data";
import {
  deleteProductAction,
  deleteSubmissionAction,
  logoutAction,
  saveProductAction,
  updateSubmissionStatusAction,
} from "./actions";

type StudioPageProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Studio | Eltronic",
};

const inputGridClass = "grid gap-2";
const selectClass =
  "flex h-10 w-full rounded-xl border border-input bg-background/60 px-3 py-2 text-sm text-foreground shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]";

export default async function StudioPage({ searchParams }: StudioPageProps) {
  if (!(await isAdminAuthenticated())) {
    redirect("/studio/login");
  }

  const params = await searchParams;
  const [products, families, submissions] = await Promise.all([
    getProducts(),
    getProductFamilies(),
    getSubmissions(),
  ]);
  const templates = new Set(products.map((product) => product.template));
  const newSubmissions = submissions.filter((submission) => submission.status === "new");
  const storageMode = getStorageMode();

  return (
    <main className="page">
      <section className="mb-8 overflow-hidden rounded-[2rem] border border-primary/20 bg-[radial-gradient(circle_at_top_right,rgba(139,211,255,0.18),transparent_28rem),rgba(15,23,42,0.78)] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.32)] md:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="code-kicker">admin.studio</p>
            <h1 className="mb-4">Eltronic Studio</h1>
            <p className="lede max-w-3xl">
              Manage product content, assign templates and review contact submissions without touching WordPress.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="secondary">
              <Link href="/">View site</Link>
            </Button>
            <form action={logoutAction}>
              <Button type="submit" variant="outline">
                <LogOut className="size-4" />
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </section>

      {params?.error ? (
        <div className="mb-6 rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-100">
          {params.error}
        </div>
      ) : null}

      {!hasPersistentStorage() ? (
        <div className="mb-6 rounded-2xl border border-amber-300/30 bg-amber-300/10 p-4 text-sm text-amber-100">
          Storage is currently <strong>{storageMode}</strong>. Local admin edits work on this machine, but Vercel
          needs <code>KV_REST_API_URL</code> and <code>KV_REST_API_TOKEN</code> for persistent live storage.
        </div>
      ) : null}

      <section className="mb-8 grid gap-4 md:grid-cols-4">
        <MetricCard icon={<Boxes className="size-5" />} label="Products" value={products.length.toString()} />
        <MetricCard icon={<LayoutTemplate className="size-5" />} label="Templates" value={templates.size.toString()} />
        <MetricCard icon={<Inbox className="size-5" />} label="New enquiries" value={newSubmissions.length.toString()} />
        <MetricCard icon={<Database className="size-5" />} label="Storage" value={storageMode} compact />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.8fr)]">
        <div className="grid gap-6">
          <Card className="border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                  <Plus className="size-5" />
                </div>
                <div>
                  <CardTitle>Add product</CardTitle>
                  <CardDescription>Create a new catalogue item and choose its page template.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ProductForm families={families} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-2xl bg-secondary text-primary">
                  <FilePenLine className="size-5" />
                </div>
                <div>
                  <CardTitle>Product management</CardTitle>
                  <CardDescription>Edit product data in simple structured fields.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4">
              {products.map((product) => (
                <details
                  className="group rounded-2xl border border-border bg-background/35 p-4 open:bg-background/55"
                  key={product.slug}
                >
                  <summary className="flex cursor-pointer list-none flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="mb-0 text-lg">{product.name}</h3>
                        <Badge variant="outline">{product.template}</Badge>
                      </div>
                      <p className="mb-0 text-sm text-muted-foreground">{product.summary}</p>
                    </div>
                    <span className="text-xs font-bold uppercase tracking-[0.22em] text-primary">
                      edit
                    </span>
                  </summary>
                  <Separator className="my-5" />
                  <ProductForm product={product} families={families} />
                  <form action={deleteProductAction} className="mt-4">
                    <input name="slug" type="hidden" value={product.slug} />
                    <Button type="submit" variant="destructive">
                      Delete product
                    </Button>
                  </form>
                </details>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card className="h-fit">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                <Mail className="size-5" />
              </div>
              <div>
                <CardTitle>Contact submissions</CardTitle>
                <CardDescription>Messages from the public contact form land here.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4">
            {submissions.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
                No submissions yet. The contact form is wired and ready.
              </div>
            ) : null}
            {submissions.map((submission) => (
              <SubmissionCard submission={submission} key={submission.id} />
            ))}
          </CardContent>
        </Card>
      </section>
    </main>
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

function ProductForm({ families, product }: { families: string[]; product?: Product }) {
  const formId = product?.slug ?? "new";

  return (
    <form action={saveProductAction} className="grid gap-5">
      <input name="previousSlug" type="hidden" value={product?.slug ?? ""} />
      <div className="grid gap-4 md:grid-cols-2">
        <div className={inputGridClass}>
          <Label htmlFor={`${formId}-name`}>Name</Label>
          <Input id={`${formId}-name`} name="name" defaultValue={product?.name} required />
        </div>
        <div className={inputGridClass}>
          <Label htmlFor={`${formId}-slug`}>Slug</Label>
          <Input id={`${formId}-slug`} name="slug" defaultValue={product?.slug} placeholder="auto-generated if blank" />
        </div>
        <div className={inputGridClass}>
          <Label htmlFor={`${formId}-category`}>Category</Label>
          <Input id={`${formId}-category`} name="category" defaultValue={product?.category} />
        </div>
        <div className={inputGridClass}>
          <Label htmlFor={`${formId}-family`}>Family</Label>
          <Input id={`${formId}-family`} name="family" defaultValue={product?.family} list={`${formId}-families`} />
          <datalist id={`${formId}-families`}>
            {families.map((family) => (
              <option key={family} value={family} />
            ))}
          </datalist>
        </div>
        <div className={inputGridClass}>
          <Label htmlFor={`${formId}-template`}>Template</Label>
          <select className={selectClass} defaultValue={product?.template ?? "hmi"} id={`${formId}-template`} name="template">
            <option value="hmi">HMI</option>
            <option value="data-logger">Data logger</option>
            <option value="module">Module</option>
          </select>
        </div>
        <div className={inputGridClass}>
          <Label htmlFor={`${formId}-enquiry`}>CTA label</Label>
          <Input id={`${formId}-enquiry`} name="enquiryPrompt" defaultValue={product?.enquiryPrompt} />
        </div>
      </div>

      <div className={inputGridClass}>
        <Label htmlFor={`${formId}-summary`}>Summary</Label>
        <Textarea id={`${formId}-summary`} name="summary" defaultValue={product?.summary} required />
      </div>
      <div className={inputGridClass}>
        <Label htmlFor={`${formId}-description`}>Description</Label>
        <Textarea id={`${formId}-description`} name="description" defaultValue={product?.description} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className={inputGridClass}>
          <Label htmlFor={`${formId}-image`}>Image URL</Label>
          <Input id={`${formId}-image`} name="imageSrc" defaultValue={product?.image.src} />
        </div>
        <div className={inputGridClass}>
          <Label htmlFor={`${formId}-image-alt`}>Image alt text</Label>
          <Input id={`${formId}-image-alt`} name="imageAlt" defaultValue={product?.image.alt} />
        </div>
      </div>

      <div className={inputGridClass}>
        <Label htmlFor={`${formId}-source`}>Source URL</Label>
        <Input id={`${formId}-source`} name="sourceUrl" defaultValue={product?.sourceUrl} />
      </div>
      <div className={inputGridClass}>
        <Label htmlFor={`${formId}-highlights`}>Highlights, one per line</Label>
        <Textarea id={`${formId}-highlights`} name="highlights" defaultValue={linesToText(product?.highlights)} />
      </div>
      <div className={inputGridClass}>
        <Label htmlFor={`${formId}-specs`}>Specs, one per line as Label | Value</Label>
        <Textarea
          id={`${formId}-specs`}
          name="specifications"
          defaultValue={specsToText(product?.specifications)}
        />
      </div>
      <div className={inputGridClass}>
        <Label htmlFor={`${formId}-docs`}>Documents, one per line as Label | URL</Label>
        <Textarea id={`${formId}-docs`} name="documents" defaultValue={documentsToText(product?.documents)} />
      </div>
      <div className={inputGridClass}>
        <Label htmlFor={`${formId}-variants`}>Variants, one per line as Name | Details | Article number</Label>
        <Textarea id={`${formId}-variants`} name="variants" defaultValue={variantsToText(product?.variants)} />
      </div>
      <Button type="submit">
        <ShieldCheck className="size-4" />
        {product ? "Save product" : "Create product"}
      </Button>
    </form>
  );
}

function SubmissionCard({ submission }: { submission: ContactSubmission }) {
  return (
    <article className="rounded-2xl border border-border bg-background/35 p-4">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="mb-1 text-lg">{submission.name}</h3>
          <p className="mb-0 text-sm text-muted-foreground">{formatDate(submission.createdAt)}</p>
        </div>
        <Badge variant={submission.status === "new" ? "warning" : "outline"}>{submission.status}</Badge>
      </div>
      <div className="grid gap-2 text-sm text-muted-foreground">
        <a className="text-primary" href={`mailto:${submission.email}`}>
          {submission.email}
        </a>
        {submission.company ? <span>{submission.company}</span> : null}
        {submission.productName ? <span>Product: {submission.productName}</span> : null}
      </div>
      <p className="mt-4 whitespace-pre-wrap rounded-xl bg-muted p-3 text-sm text-foreground">{submission.message}</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
        <form action={updateSubmissionStatusAction} className="flex gap-2">
          <input name="id" type="hidden" value={submission.id} />
          <select className={selectClass} defaultValue={submission.status} name="status">
            {(["new", "reviewed", "replied", "archived"] satisfies ContactSubmissionStatus[]).map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <Button type="submit" variant="secondary">
            Update
          </Button>
        </form>
        <form action={deleteSubmissionAction}>
          <input name="id" type="hidden" value={submission.id} />
          <Button type="submit" variant="outline">
            Delete
          </Button>
        </form>
      </div>
    </article>
  );
}

function linesToText(lines?: string[]) {
  return lines?.join("\n") ?? "";
}

function specsToText(specs?: Product["specifications"]) {
  return specs?.map((spec) => `${spec.label} | ${spec.value}`).join("\n") ?? "";
}

function documentsToText(documents?: Product["documents"]) {
  return documents?.map((document) => `${document.label} | ${document.url}`).join("\n") ?? "";
}

function variantsToText(variants?: Product["variants"]) {
  return (
    variants
      ?.map((variant) => `${variant.name} | ${variant.details} | ${variant.articleNumber ?? ""}`)
      .join("\n") ?? ""
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
