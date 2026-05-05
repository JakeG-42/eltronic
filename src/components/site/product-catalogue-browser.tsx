"use client";

import Link from "next/link";
import { useDeferredValue, useState } from "react";
import { ManagedImage } from "@/components/site/managed-image";
import type { Product } from "@/content/products";

type ProductCatalogueBrowserProps = {
  products: Product[];
  productCategories: string[];
  productFamilies: string[];
};

const allFilter = "all";

export function ProductCatalogueBrowser({
  products,
  productCategories,
  productFamilies,
}: ProductCatalogueBrowserProps) {
  const [query, setQuery] = useState("");
  const [activeFamily, setActiveFamily] = useState(allFilter);
  const [activeCategory, setActiveCategory] = useState(allFilter);
  const deferredQuery = useDeferredValue(query);
  const normalizedQuery = deferredQuery.trim().toLowerCase();

  const filteredProducts = products.filter((product) => {
    const matchesFamily = activeFamily === allFilter || product.family === activeFamily;
    const matchesCategory = activeCategory === allFilter || product.category === activeCategory;
    const searchableText = [
      product.name,
      product.family,
      product.category,
      product.summary,
      product.description,
      ...(product.tags ?? []),
      ...product.highlights,
    ]
      .join(" ")
      .toLowerCase();
    const matchesSearch = normalizedQuery.length === 0 || searchableText.includes(normalizedQuery);

    return matchesFamily && matchesCategory && matchesSearch;
  });

  const hasActiveFilters = query || activeFamily !== allFilter || activeCategory !== allFilter;

  function clearFilters() {
    setQuery("");
    setActiveFamily(allFilter);
    setActiveCategory(allFilter);
  }

  return (
    <>
      <section className="catalogue-hero section">
        <div className="catalogue-intro">
          <p className="code-kicker">products.index</p>
          <h1 className="catalogue-title">Product.Catalogue</h1>
          <p className="lede catalogue-lede">
            Rugged HMI displays, CAN-Bus data logging and control modules for
            quote-led specification, integration and support.
          </p>
        </div>

        <aside className="catalogue-filter-panel panel" aria-label="Product catalogue filters">
          <div className="catalogue-filter-heading">
            <span>Find the right product</span>
            <strong>
              {filteredProducts.length} / {products.length}
            </strong>
          </div>

          <label className="catalogue-search">
            <span>Search catalogue</span>
            <input
              aria-label="Search products"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search HMI, CAN-Bus, I/O..."
              type="search"
              value={query}
            />
          </label>

          <div className="catalogue-filter-group">
            <span>Family</span>
            <div className="catalogue-chip-row" role="list" aria-label="Product families">
              <FilterChip active={activeFamily === allFilter} label="All" onClick={() => setActiveFamily(allFilter)} />
              {productFamilies.map((family) => (
                <FilterChip
                  active={activeFamily === family}
                  key={family}
                  label={family}
                  onClick={() => setActiveFamily(family)}
                />
              ))}
            </div>
          </div>

          <div className="catalogue-filter-group">
            <span>Category</span>
            <div className="catalogue-chip-row" role="list" aria-label="Product categories">
              <FilterChip
                active={activeCategory === allFilter}
                label="All"
                onClick={() => setActiveCategory(allFilter)}
              />
              {productCategories.map((category) => (
                <FilterChip
                  active={activeCategory === category}
                  key={category}
                  label={category}
                  onClick={() => setActiveCategory(category)}
                />
              ))}
            </div>
          </div>

          {hasActiveFilters ? (
            <button className="catalogue-reset" onClick={clearFilters} type="button">
              Clear filters
            </button>
          ) : null}
        </aside>
      </section>

      <section className="catalogue-results" aria-live="polite">
        <div className="catalogue-results-bar">
          <p>
            Showing <strong>{filteredProducts.length}</strong> matching product
            {filteredProducts.length === 1 ? "" : "s"}
          </p>
          <span>Open a product to review gallery, highlights and technical data.</span>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="product-grid">
            {filteredProducts.map((product) => (
              <Link className="product-card" href={`/products/${product.slug}`} key={product.slug}>
                <div className="product-media">
                  <ManagedImage
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
          </div>
        ) : (
          <div className="catalogue-empty panel">
            <h2>No matching products</h2>
            <p>Try clearing the filters, or send the application details and we can point you in the right direction.</p>
            <div className="actions">
              <button className="button secondary" onClick={clearFilters} type="button">
                Clear filters
              </button>
              <Link className="button" href="/contact">
                Ask for help
              </Link>
            </div>
          </div>
        )}
      </section>
    </>
  );
}

type FilterChipProps = {
  active: boolean;
  label: string;
  onClick: () => void;
};

function FilterChip({ active, label, onClick }: FilterChipProps) {
  return (
    <button
      aria-pressed={active}
      className={active ? "catalogue-chip active" : "catalogue-chip"}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}
