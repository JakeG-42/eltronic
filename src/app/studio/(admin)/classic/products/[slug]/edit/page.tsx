import Link from "next/link";
import { notFound } from "next/navigation";

import { WooCommerceProductEditor } from "@/components/studio/classic/woocommerce-product-editor";
import { getProductBySlug, getProductFamilies } from "@/lib/managed-data";

type ClassicEditProductPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: ClassicEditProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  return {
    title: product ? `Edit ${product.name} | Classic Studio` : "Edit Product | Classic Studio",
  };
}

export default async function ClassicEditProductPage({ params }: ClassicEditProductPageProps) {
  const { slug } = await params;
  const [product, families] = await Promise.all([getProductBySlug(slug), getProductFamilies()]);

  if (!product) {
    notFound();
  }

  return (
    <div className="wrap">
      <div className="wp-screen-tabs">
        <button type="button">Screen Options</button>
        <button type="button">Help</button>
      </div>
      <header className="wp-page-title-action-row">
        <h1>
          Edit Product <Link href="/studio/classic/products/new">Add New</Link>
        </h1>
        <Link className="wp-view-link" href={`/products/${product.slug}`} target="_blank">
          View product
        </Link>
      </header>
      <WooCommerceProductEditor
        families={families}
        product={product}
        returnTo={`/studio/classic/products/${product.slug}/edit`}
      />
    </div>
  );
}
