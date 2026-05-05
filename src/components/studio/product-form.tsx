import { ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";

import { saveProductAction } from "@/app/studio/actions";
import { ProductImageManager } from "@/components/studio/product-image-manager";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { productModuleDefinitions, type Product, type ProductModuleKey } from "@/content/products";

const inputGridClass = "grid gap-2";
const selectClass =
  "flex h-10 w-full rounded-xl border border-input bg-background/60 px-3 py-2 text-sm text-foreground shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]";

export function ProductForm({
  families,
  product,
  returnTo = "/studio/products",
  submitLabel,
}: {
  families: string[];
  product?: Product;
  returnTo?: string;
  submitLabel?: string;
}) {
  const formId = product?.slug ?? "new";
  const imageItems = editableImages(product);
  const submitText = submitLabel ?? (product ? "Save product" : "Create product");

  return (
    <form action={saveProductAction} className="studio-product-editor">
      <input name="previousSlug" type="hidden" value={product?.slug ?? ""} />
      <input name="returnTo" type="hidden" value={returnTo} />

      <div className="studio-editor-main">
        <ProductFormSection
          eyebrow="product.data"
          title="Product data"
          description="Core catalogue fields, similar to the main product panel in a commerce CMS."
        >
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
        </ProductFormSection>

        <ProductFormSection
          eyebrow="public.copy"
          title="Public copy"
          description="The short listing copy and the longer product-page introduction."
        >
          <div className={inputGridClass}>
            <Label htmlFor={`${formId}-summary`}>Summary</Label>
            <Textarea id={`${formId}-summary`} name="summary" defaultValue={product?.summary} required />
          </div>
          <div className={inputGridClass}>
            <Label htmlFor={`${formId}-description`}>Description</Label>
            <Textarea id={`${formId}-description`} name="description" defaultValue={product?.description} />
          </div>
        </ProductFormSection>

        <ProductFormSection
          eyebrow="product.media"
          title="Images and gallery"
          description="Preview, edit and order the image gallery. The first image becomes the primary product image."
          defaultOpen={!product}
        >
          <ProductImageManager images={imageItems} />
        </ProductFormSection>

        <ProductFormSection
          eyebrow="technical.content"
          title="Technical content"
          description="Structured supporting information for detailed product specifications and documents."
          defaultOpen={false}
        >
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
        </ProductFormSection>

        <ProductFormSection
          eyebrow="product.variables"
          title="Variables and variants"
          description="Commerce-style product options. Saved for the admin now; public rendering can be enabled later."
          defaultOpen={false}
        >
          <div className={inputGridClass}>
            <Label htmlFor={`${formId}-variants`}>One per line as Name | SKU | Price | Details | Article number</Label>
            <Textarea
              id={`${formId}-variants`}
              name="variants"
              defaultValue={variantsToText(product?.variants)}
              placeholder="BASIC with OPUS Projektor | OPUSA3EN1CANB000 | POA | I.MX35, 128MB RAM | OPUSA3EN1CANB000"
            />
            <p className="studio-field-hint">
              Older rows with Name | Details | Article number are still accepted when saving.
            </p>
          </div>
        </ProductFormSection>
      </div>

      <aside className="studio-editor-sidebar" aria-label="Product publish and management panels">
        <section className="studio-editor-panel studio-publish-panel">
          <span className="studio-eyebrow">publish</span>
          <h2>{product ? "Save product" : "Create product"}</h2>
          <p>Save the managed product record. The public site reads this catalogue data directly.</p>
          <dl className="studio-editor-summary">
            <div>
              <dt>Template</dt>
              <dd>{product?.template ?? "HMI default"}</dd>
            </div>
            <div>
              <dt>Gallery</dt>
              <dd>{imageItems.length || 1} saved, no image limit</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>{product ? "Existing product" : "New draft"}</dd>
            </div>
          </dl>
          <div className="studio-form-actions">
            <Button className="w-full" type="submit">
              <ShieldCheck className="size-4" />
              {submitText}
            </Button>
          </div>
        </section>

        <ProductFormSection
          eyebrow="commerce.data"
          title="Inventory, pricing and tags"
          description="Admin-only fields, saved now but not shown publicly yet."
        >
          <div className="grid gap-4">
            <div className={inputGridClass}>
              <Label htmlFor={`${formId}-sku`}>SKU</Label>
              <Input id={`${formId}-sku`} name="sku" defaultValue={product?.sku} placeholder="Internal product code" />
            </div>
            <div className={inputGridClass}>
              <Label htmlFor={`${formId}-price`}>Price</Label>
              <Input id={`${formId}-price`} name="price" defaultValue={product?.price} placeholder="POA, £0.00, or internal guide" />
            </div>
          </div>
          <div className={inputGridClass}>
            <Label htmlFor={`${formId}-tags`}>Tags</Label>
            <Input
              id={`${formId}-tags`}
              name="tags"
              defaultValue={product?.tags?.join(", ")}
              placeholder="hmi, CAN-Bus, rugged, topcon"
            />
            <p className="studio-field-hint">Comma-separated tags for filtering, grouping and future admin workflows.</p>
          </div>
        </ProductFormSection>

        <ProductFormSection
          eyebrow="module.controls"
          title="Product modules"
          description="Switch product-page modules on or off for this record."
          defaultOpen={false}
        >
          <div className="studio-module-grid">
            {productModuleDefinitions.map((module) => (
              <label className="studio-module-toggle" key={module.key}>
                <input
                  defaultChecked={isModuleEnabled(product, module.key)}
                  name="enabledModules"
                  type="checkbox"
                  value={module.key}
                />
                <span>
                  <strong>{module.label}</strong>
                  <small>{module.description}</small>
                </span>
              </label>
            ))}
          </div>
        </ProductFormSection>
      </aside>
    </form>
  );
}

function ProductFormSection({
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

function editableImages(product?: Product) {
  if (!product) {
    return [];
  }

  const images = Array.isArray(product.images) && product.images.length > 0 ? product.images : [product.image];

  return images.filter((image) => image?.src && !image.src.startsWith("/product-gallery/"));
}

function isModuleEnabled(product: Product | undefined, key: ProductModuleKey) {
  return product?.modules?.[key] ?? true;
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
      ?.map((variant) =>
        [variant.name, variant.sku ?? "", variant.price ?? "", variant.details, variant.articleNumber ?? ""].join(" | "),
      )
      .join("\n") ?? ""
  );
}
