import Link from "next/link";

import { WooCommerceProductEditor } from "@/components/studio/classic/woocommerce-product-editor";
import { getProductFamilies } from "@/lib/managed-data";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Add New Product | Classic Studio",
};

export default async function ClassicNewProductPage() {
  const families = await getProductFamilies();

  return (
    <div className="wrap">
      <div className="wp-screen-tabs">
        <button type="button">Screen Options</button>
        <button type="button">Help</button>
      </div>
      <header className="wp-page-title-action-row">
        <h1>
          Add New Product <Link href="/studio/classic/products">All Products</Link>
        </h1>
      </header>
      <WooCommerceProductEditor families={families} returnTo="/studio/classic/products" />
    </div>
  );
}
