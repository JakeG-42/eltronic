import Link from "next/link";
import { notFound } from "next/navigation";

import { deleteProductAction } from "@/app/studio/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductForm } from "@/components/studio/product-form";
import { getProductBySlug, getProductFamilies } from "@/lib/managed-data";

type EditProductPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: EditProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  return {
    title: product ? `Edit ${product.name} | Eltronic Studio` : "Edit Product | Eltronic Studio",
  };
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { slug } = await params;
  const [product, families] = await Promise.all([getProductBySlug(slug), getProductFamilies()]);

  if (!product) {
    notFound();
  }

  return (
    <div className="grid gap-6">
      <section className="studio-page-header">
        <p>
          Editing <strong>{product.name}</strong>. Manage gallery order, product content and admin-only data controls.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href="/studio/products">Back to products</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href={`/products/${product.slug}`} target="_blank">
              View public page
            </Link>
          </Button>
        </div>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Product details</CardTitle>
          <CardDescription>Preview images, adjust the gallery order and manage the public product record.</CardDescription>
        </CardHeader>
        <CardContent>
          <ProductForm families={families} product={product} returnTo={`/studio/products/${product.slug}/edit`} />
          <form action={deleteProductAction} className="mt-5">
            <input name="slug" type="hidden" value={product.slug} />
            <input name="returnTo" type="hidden" value="/studio/products" />
            <Button type="submit" variant="destructive">
              Delete product
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
