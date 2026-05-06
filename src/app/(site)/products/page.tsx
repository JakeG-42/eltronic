import { ProductCatalogueBrowser } from "@/components/site/product-catalogue-browser";
import { getProductFamilies, getProducts } from "@/lib/managed-data";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Products",
  description:
    "Browse Eltronic product modules, hardware, devices and technical products for wider systems and integration projects.",
  path: "/products",
});

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const [products, productFamilies] = await Promise.all([getProducts(), getProductFamilies()]);
  const productCategories = Array.from(new Set(products.map((product) => product.category))).sort((a, b) =>
    a.localeCompare(b),
  );

  return (
    <main className="page">
      <ProductCatalogueBrowser
        productCategories={productCategories}
        productFamilies={productFamilies}
        products={products}
      />
    </main>
  );
}
