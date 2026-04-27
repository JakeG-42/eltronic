import Image from "next/image";
import Link from "next/link";

import { deleteProductAction } from "@/app/studio/actions";
import { getProductFamilies, getProductImages, getProducts } from "@/lib/managed-data";

type ClassicProductsPageProps = {
  searchParams?: Promise<{
    s?: string;
  }>;
};

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Products | Classic Studio",
};

export default async function ClassicProductsPage({ searchParams }: ClassicProductsPageProps) {
  const params = await searchParams;
  const [products, families] = await Promise.all([getProducts(), getProductFamilies()]);
  const search = params?.s?.toLowerCase().trim() ?? "";
  const visibleProducts = search
    ? products.filter((product) =>
        [product.name, product.sku, product.category, product.family, product.summary].some((value) =>
          value?.toLowerCase().includes(search),
        ),
      )
    : products;

  return (
    <div className="wrap wp-products-screen">
      <div className="wp-screen-tabs">
        <button type="button">Screen Options</button>
        <button type="button">Help</button>
      </div>

      <header className="wp-page-title-action-row">
        <h1>
          Products <Link href="/studio/classic/products/new">Add New</Link>
        </h1>
        <form className="wp-search-box">
          <input defaultValue={params?.s ?? ""} name="s" placeholder="Search products" />
          <button type="submit">Search Products</button>
        </form>
      </header>

      <ul className="wp-subsubsub">
        <li>
          <a href="#">All <span>({products.length})</span></a>
        </li>
        <li>
          <a href="#">Published <span>({products.length})</span></a>
        </li>
        <li>
          <a href="#">Drafts <span>(0)</span></a>
        </li>
      </ul>

      <div className="wp-tablenav">
        <div>
          <select defaultValue="">
            <option value="">Bulk actions</option>
            <option value="trash">Move to Trash</option>
          </select>
          <button type="button">Apply</button>
        </div>
        <div>
          <select defaultValue="">
            <option value="">Filter by category</option>
            {families.map((family) => (
              <option key={family}>{family}</option>
            ))}
          </select>
          <select defaultValue="">
            <option value="">Filter by product type</option>
            <option>Simple product</option>
            <option>Variable product</option>
            <option>Grouped product</option>
          </select>
          <button type="button">Filter</button>
        </div>
      </div>

      <table className="wp-list-table widefat striped">
        <thead>
          <tr>
            <td className="check-column">
              <input aria-label="Select all products" type="checkbox" />
            </td>
            <th>Image</th>
            <th>Name</th>
            <th>SKU</th>
            <th>Stock</th>
            <th>Price</th>
            <th>Categories</th>
            <th>Tags</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {visibleProducts.map((product) => {
            const images = getProductImages(product);
            const primaryImage = images[0] ?? product.image;

            return (
              <tr key={product.slug}>
                <th className="check-column">
                  <input aria-label={`Select ${product.name}`} type="checkbox" />
                </th>
                <td>
                  <Image
                    className="wp-product-thumb"
                    src={primaryImage.src}
                    alt={primaryImage.alt}
                    width={52}
                    height={52}
                  />
                </td>
                <td className="column-primary">
                  <strong>
                    <Link href={`/studio/classic/products/${product.slug}/edit`}>{product.name}</Link>
                  </strong>
                  <div className="row-actions">
                    <Link href={`/studio/classic/products/${product.slug}/edit`}>Edit</Link>
                    <span>|</span>
                    <Link href={`/studio/classic/products/${product.slug}/edit#advanced`}>Quick Edit</Link>
                    <span>|</span>
                    <Link href={`/products/${product.slug}`} target="_blank">View</Link>
                    <span>|</span>
                    <form action={deleteProductAction}>
                      <input name="slug" type="hidden" value={product.slug} />
                      <input name="returnTo" type="hidden" value="/studio/classic/products" />
                      <button type="submit">Trash</button>
                    </form>
                  </div>
                </td>
                <td>{product.sku || "-"}</td>
                <td>
                  <mark className="wp-stock-status">In stock</mark>
                </td>
                <td>{product.price || "-"}</td>
                <td>{product.family}</td>
                <td>{product.tags?.join(", ") || "Untagged"}</td>
                <td>Published</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
