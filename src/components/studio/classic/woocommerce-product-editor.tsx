import { Save } from "lucide-react";

import { deleteProductAction, saveProductAction } from "@/app/studio/actions";
import { ProductImageManager } from "@/components/studio/product-image-manager";
import { Button } from "@/components/ui/button";
import { productModuleDefinitions, type Product, type ProductModuleKey } from "@/content/products";

type WooCommerceProductEditorProps = {
  families: string[];
  product?: Product;
  returnTo: string;
};

const inputClass = "wp-input";

export function WooCommerceProductEditor({ families, product, returnTo }: WooCommerceProductEditorProps) {
  const formId = product?.slug ?? "classic-new-product";
  const images = editableImages(product);

  return (
    <div className="wp-product-edit-screen">
      <form action={saveProductAction} className="wp-product-form" id={`${formId}-form`}>
        <input name="previousSlug" type="hidden" value={product?.slug ?? ""} />
        <input name="returnTo" type="hidden" value={returnTo} />

        <section className="wp-post-body">
          <input
            aria-label="Product name"
            className="wp-title-input"
            name="name"
            placeholder="Product name"
            required
            defaultValue={product?.name}
          />

          <div className="wp-permalink-row">
            <span>Permalink:</span>
            <input className={inputClass} name="slug" placeholder="auto-generated if blank" defaultValue={product?.slug} />
          </div>

          <div className="wp-editor-box">
            <div className="wp-editor-toolbar">
              <button type="button">Add Media</button>
              <span>Visual</span>
              <span>Text</span>
            </div>
            <textarea
              aria-label="Long description"
              className="wp-editor-textarea"
              name="description"
              placeholder="Long product description"
              defaultValue={product?.description}
            />
          </div>

          <section className="wp-metabox wc-product-data-box">
            <header className="wp-metabox-header">
              <strong>Product data</strong>
              <select className={inputClass} defaultValue={product?.template ?? "hmi"} name="template">
                <option value="hmi">Simple product / HMI template</option>
                <option value="data-logger">Variable product / Data logger template</option>
                <option value="module">Grouped product / Control module template</option>
              </select>
              <label>
                <input type="checkbox" /> Virtual
              </label>
              <label>
                <input type="checkbox" /> Downloadable
              </label>
            </header>

            <div className="wc-product-data-layout">
              <nav className="wc-product-tabs" aria-label="Product data tabs">
                <a href="#general">General</a>
                <a href="#inventory">Inventory</a>
                <a href="#shipping">Shipping</a>
                <a href="#linked">Linked Products</a>
                <a href="#attributes">Attributes</a>
                <a href="#variations">Variations</a>
                <a href="#advanced">Advanced</a>
              </nav>

              <div className="wc-product-panels">
                <Panel id="general" title="General">
                  <Field label="Regular price (£)">
                    <input className={inputClass} name="price" placeholder="POA or guide price" defaultValue={product?.price} />
                  </Field>
                  <Field label="Source / supplier URL">
                    <input className={inputClass} name="sourceUrl" placeholder="https://..." defaultValue={product?.sourceUrl} />
                  </Field>
                  <Field label="Product enquiry button">
                    <input className={inputClass} name="enquiryPrompt" defaultValue={product?.enquiryPrompt} />
                  </Field>
                </Panel>

                <Panel id="inventory" title="Inventory">
                  <Field label="SKU">
                    <input className={inputClass} name="sku" placeholder="Internal stock code" defaultValue={product?.sku} />
                  </Field>
                  <Field label="Stock status">
                    <select className={inputClass} defaultValue="instock">
                      <option value="instock">In stock</option>
                      <option value="outofstock">Out of stock</option>
                      <option value="onbackorder">On backorder</option>
                    </select>
                  </Field>
                  <label className="wp-check-row">
                    <input type="checkbox" /> Sold individually
                  </label>
                </Panel>

                <Panel id="shipping" title="Shipping">
                  <div className="wp-field-grid">
                    <Field label="Weight">
                      <input className={inputClass} placeholder="kg" />
                    </Field>
                    <Field label="Dimensions">
                      <input className={inputClass} placeholder="L x W x H" />
                    </Field>
                  </div>
                  <p className="wp-help-text">Shipping controls are modelled for future use; Eltronic currently remains enquiry-led.</p>
                </Panel>

                <Panel id="linked" title="Linked products">
                  <Field label="Upsells">
                    <input className={inputClass} placeholder="Search for a product..." />
                  </Field>
                  <Field label="Cross-sells">
                    <input className={inputClass} placeholder="Search for a product..." />
                  </Field>
                </Panel>

                <Panel id="attributes" title="Attributes">
                  <Field label="Family">
                    <input className={inputClass} name="family" list={`${formId}-families`} defaultValue={product?.family} />
                    <datalist id={`${formId}-families`}>
                      {families.map((family) => (
                        <option key={family} value={family} />
                      ))}
                    </datalist>
                  </Field>
                  <Field label="Tags / attributes">
                    <input className={inputClass} name="tags" placeholder="hmi, CAN-Bus, rugged" defaultValue={product?.tags?.join(", ")} />
                  </Field>
                  <p className="wp-help-text">Use tags now for filtering and future product attributes.</p>
                </Panel>

                <Panel id="variations" title="Variations">
                  <textarea
                    className="wp-code-textarea"
                    name="variants"
                    placeholder="Name | SKU | Price | Details | Article number"
                    defaultValue={variantsToText(product?.variants)}
                  />
                  <p className="wp-help-text">Variation-style rows are saved into the product variants model.</p>
                </Panel>

                <Panel id="advanced" title="Advanced">
                  <Field label="Highlights">
                    <textarea className="wp-code-textarea" name="highlights" defaultValue={linesToText(product?.highlights)} />
                  </Field>
                  <Field label="Specifications">
                    <textarea className="wp-code-textarea" name="specifications" defaultValue={specsToText(product?.specifications)} />
                  </Field>
                  <Field label="Documents">
                    <textarea className="wp-code-textarea" name="documents" defaultValue={documentsToText(product?.documents)} />
                  </Field>
                  <div className="wp-module-checkboxes">
                    {productModuleDefinitions.map((module) => (
                      <label key={module.key}>
                        <input
                          defaultChecked={isModuleEnabled(product, module.key)}
                          name="enabledModules"
                          type="checkbox"
                          value={module.key}
                        />
                        {module.label}
                      </label>
                    ))}
                  </div>
                </Panel>
              </div>
            </div>
          </section>

          <section className="wp-metabox">
            <header className="wp-metabox-header">
              <strong>Product short description</strong>
            </header>
            <textarea
              className="wp-editor-textarea short"
              name="summary"
              required
              placeholder="Short description used in cards and product lists."
              defaultValue={product?.summary}
            />
          </section>
        </section>

        <aside className="wp-product-side">
          <section className="wp-metabox wp-submitbox">
            <header className="wp-metabox-header">
              <strong>Publish</strong>
            </header>
            <div className="wp-submitbox-body">
              <p>Status: <strong>Published</strong></p>
              <p>Visibility: <strong>Public</strong></p>
              <p>Catalogue visibility: <strong>Catalogue and search results</strong></p>
              <Button className="w-full" type="submit">
                <Save className="size-4" />
                {product ? "Update" : "Publish"}
              </Button>
            </div>
          </section>

          <section className="wp-metabox">
            <header className="wp-metabox-header">
              <strong>Product categories</strong>
            </header>
            <div className="wp-taxonomy-box">
              <label>
                <input type="radio" defaultChecked name="categoryPreset" /> Catalogue
              </label>
              <label>
                <input type="radio" name="categoryPreset" /> HMI displays
              </label>
              <label>
                <input type="radio" name="categoryPreset" /> Data logging
              </label>
              <input className={inputClass} name="category" placeholder="Primary category" defaultValue={product?.category} />
            </div>
          </section>

          <section className="wp-metabox">
            <header className="wp-metabox-header">
              <strong>Product tags</strong>
            </header>
            <input
              className={inputClass}
              name="classicTagsMirror"
              placeholder="Managed in Product data > Attributes"
              readOnly
              defaultValue={product?.tags?.join(", ")}
            />
          </section>

          <section className="wp-metabox">
            <header className="wp-metabox-header">
              <strong>Product image</strong>
            </header>
            <ProductImageManager idPrefix="classic-primary" images={images.slice(0, 1)} />
          </section>

          <section className="wp-metabox">
            <header className="wp-metabox-header">
              <strong>Product gallery</strong>
            </header>
            <ProductImageManager
              idPrefix="classic-gallery"
              images={images.length > 1 ? images.slice(1) : []}
              requireFirst={false}
            />
          </section>
        </aside>
      </form>

      {product ? (
        <form action={deleteProductAction} className="wp-trash-form">
          <input name="slug" type="hidden" value={product.slug} />
          <input name="returnTo" type="hidden" value="/studio/classic/products" />
          <button type="submit">Move to Trash</button>
        </form>
      ) : null}
    </div>
  );
}

function Panel({ children, id, title }: { children: React.ReactNode; id: string; title: string }) {
  return (
    <section className="wc-product-panel" id={id}>
      <h3>{title}</h3>
      {children}
    </section>
  );
}

function Field({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <label className="wp-field">
      <span>{label}</span>
      {children}
    </label>
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
