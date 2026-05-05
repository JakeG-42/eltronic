import Link from "next/link";
import { Edit3, Eye, Images, Plus, SlidersHorizontal } from "lucide-react";

import { deleteProductAction } from "@/app/studio/actions";
import { ManagedImage } from "@/components/site/managed-image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductForm } from "@/components/studio/product-form";
import { getProductFamilies, getProductImages, getProducts } from "@/lib/managed-data";

type ProductsPageProps = {
  searchParams?: Promise<{
    error?: string;
    quick?: string;
  }>;
};

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Products | Eltronic Studio",
};

export default async function StudioProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const [products, families] = await Promise.all([getProducts(), getProductFamilies()]);
  const quickProduct = params?.quick ? products.find((product) => product.slug === params.quick) : undefined;

  return (
    <div className="grid gap-6">
      <section className="studio-page-header">
        <p>A table-first view with full edit pages and quick-edit drawer controls.</p>
        <Button asChild>
          <Link href="/studio/products/new">
            <Plus className="size-4" />
            Add product
          </Link>
        </Button>
      </section>

      {params?.error ? (
        <div className="rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-100">
          {params.error}
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Product table</CardTitle>
          <CardDescription>Quick edit keeps you in the table; full edit opens a focused page.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="studio-table-wrap">
            <table className="studio-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Inventory</th>
                  <th>Template</th>
                  <th>Family</th>
                  <th>Tags</th>
                  <th>Images</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  const images = getProductImages(product);
                  const primaryImage = images[0] ?? product.image;

                  return (
                    <tr key={product.slug}>
                      <td>
                        <div className="flex items-center gap-3">
                          <ManagedImage
                            className="studio-product-thumb"
                            src={primaryImage.src}
                            alt={primaryImage.alt}
                            width={80}
                            height={60}
                          />
                          <span>
                            <strong>{product.name}</strong>
                            <small>{product.summary}</small>
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className="studio-product-meta">
                          <strong>{product.sku || "No SKU"}</strong>
                          <small>{product.price || "No price"}</small>
                        </span>
                      </td>
                      <td>
                        <Badge variant="outline">{product.template}</Badge>
                      </td>
                      <td>{product.family}</td>
                      <td>
                        <span className="studio-tag-list">
                          {(product.tags && product.tags.length > 0 ? product.tags : ["Untagged"]).map((tag) => (
                            <Badge key={tag} variant="secondary">
                              {tag}
                            </Badge>
                          ))}
                        </span>
                      </td>
                      <td>
                        <span className="inline-flex items-center gap-2">
                          <Images className="size-4 text-primary" />
                          {images.length}
                        </span>
                      </td>
                      <td>
                        <div className="flex flex-wrap gap-2">
                          <Button asChild size="sm" variant="secondary">
                            <Link href={`/studio/products?quick=${product.slug}`}>
                              <SlidersHorizontal className="size-4" />
                              Quick
                            </Link>
                          </Button>
                          <Button asChild size="sm" variant="outline">
                            <Link href={`/studio/products/${product.slug}/edit`}>
                              <Edit3 className="size-4" />
                              Edit
                            </Link>
                          </Button>
                          <Button asChild size="sm" variant="ghost">
                            <Link href={`/products/${product.slug}`} target="_blank">
                              <Eye className="size-4" />
                            </Link>
                          </Button>
                          <form action={deleteProductAction}>
                            <input name="slug" type="hidden" value={product.slug} />
                            <input name="returnTo" type="hidden" value="/studio/products" />
                            <Button size="sm" type="submit" variant="destructive">
                              Delete
                            </Button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {quickProduct ? (
        <div className="studio-drawer-overlay">
          <aside className="studio-drawer" aria-label={`Quick edit ${quickProduct.name}`}>
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="studio-eyebrow">quick.edit</p>
                <h2 className="mb-1 text-2xl font-black">{quickProduct.name}</h2>
                <p className="mb-0 text-sm text-muted-foreground">Edits here save back to the same product record.</p>
              </div>
              <Button asChild variant="outline">
                <Link href="/studio/products">Close</Link>
              </Button>
            </div>
            <ProductForm
              families={families}
              product={quickProduct}
              returnTo="/studio/products"
              submitLabel="Save quick edit"
            />
          </aside>
        </div>
      ) : null}
    </div>
  );
}
