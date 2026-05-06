import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductForm } from "@/components/studio/product-form";
import { getProductFamilies } from "@/lib/managed-data";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "New Product | Eltronic Studio",
};

export default async function NewProductPage() {
  const families = await getProductFamilies();

  return (
    <div className="grid gap-6">
      <section className="studio-page-header">
        <p>Create a product record with the default template and order its gallery images.</p>
        <Button asChild variant="outline">
          <Link href="/studio/products">Back to products</Link>
        </Button>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Product details</CardTitle>
          <CardDescription>Add the product data, preview gallery images and order the public gallery.</CardDescription>
        </CardHeader>
        <CardContent>
          <ProductForm families={families} returnTo="/studio/products" />
        </CardContent>
      </Card>
    </div>
  );
}
