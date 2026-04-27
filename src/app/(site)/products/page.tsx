import Image from "next/image";
import Link from "next/link";
import { getProductFamilies, getProducts } from "@/lib/managed-data";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Products",
  description: "Browse Eltronic HMI, CAN data logging and control products.",
  path: "/products",
});

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const [products, productFamilies] = await Promise.all([getProducts(), getProductFamilies()]);

  return (
    <main className="page">
      <section className="section">
        <div className="section-heading">
          <div>
            <span className="section-number">products.index</span>
            <h1>Product catalogue</h1>
          </div>
          <p>
            Explore rugged displays, CAN data logging tools and control modules
            for equipment projects that need a quote-led specification.
          </p>
        </div>

        <div className="tag-row">
          {productFamilies.map((family) => (
            <span className="tag" key={family}>
              {family}
            </span>
          ))}
        </div>
      </section>

      <section className="product-grid">
        {products.map((product) => (
          <Link className="product-card" href={`/products/${product.slug}`} key={product.slug}>
            <div className="product-media">
              <Image
                src={product.image.src}
                alt={product.image.alt}
                fill
                sizes="(max-width: 680px) 50vw, (max-width: 980px) 50vw, 33vw"
              />
            </div>
            <div className="product-content">
              <div className="tag-row">
                <span className="tag">{product.family}</span>
                <span className="tag warning">{product.category}</span>
              </div>
              <h3>{product.name}</h3>
              <p>{product.summary}</p>
            </div>
          </Link>
        ))}
      </section>
    </main>
  );
}
