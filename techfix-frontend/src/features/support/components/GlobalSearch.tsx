"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { searchProducts } from "@/features/products/api/productApi";
import { searchRepairs } from "@/features/repairs/api/repairApi";
import type { Product } from "@/features/products/types/product.types";
import type { RepairListing } from "@/features/repairs/types/repair.types";

/**
 * Global search — feature UI only.
 *
 * Queries both halves of the marketplace at once and groups the results,
 * so a visitor who types "iPhone screen" doesn't have to know in advance
 * whether they want a repair service or a part.
 */
export default function GlobalSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("q") ?? "";

  const [input, setInput] = useState(query);
  const [products, setProducts] = useState<Product[]>([]);
  const [repairs, setRepairs] = useState<RepairListing[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setProducts([]);
      setRepairs([]);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    // Each side is allowed to fail independently — a broken product search
    // shouldn't hide perfectly good repair results.
    Promise.all([
      searchProducts({ q: query, limit: 6 }).catch(() => ({ items: [] as Product[] })),
      searchRepairs({ q: query, limit: 6 }).catch(() => ({ items: [] as RepairListing[] })),
    ])
      .then(([productResult, repairResult]) => {
        if (cancelled) return;
        setProducts(productResult.items);
        setRepairs(repairResult.items);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [query]);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    router.push(`/search?q=${encodeURIComponent(input.trim())}`);
  }

  const total = products.length + repairs.length;

  return (
    <section className="plist" aria-labelledby="search-heading">
      <div className="plist__head">
        <div>
          <h1 id="search-heading" className="plist__title">
            Search
          </h1>
          {query && (
            <p className="plist__subtitle">
              {isLoading ? "Searching…" : `${total} results for "${query}"`}
            </p>
          )}
        </div>

        <form className="plist__search" onSubmit={submit} role="search">
          <input
            className="plist__search-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Search repairs and products…"
            aria-label="Search TechFix"
          />
          <button type="submit" className="plist__search-btn">
            Search
          </button>
        </form>
      </div>

      {!query.trim() ? (
        <p className="dash__empty">Enter a device, brand or problem to search.</p>
      ) : isLoading ? (
        <p style={{ color: "var(--color-text-muted)" }}>Searching…</p>
      ) : total === 0 ? (
        <div>
          <p className="dash__empty">
            Nothing matched &quot;{query}&quot;. Try a broader term, like the device name on its own.
          </p>
        </div>
      ) : (
        <>
          {repairs.length > 0 && (
            <div className="search__group">
              <h2 className="plist__filter-title">Repair services</h2>
              <div className="dash__list">
                {repairs.map((listing) => (
                  <Link
                    href={`/repairs/${listing.id}`}
                    key={listing.id}
                    className="dash__card dash__card--clickable"
                  >
                    <div className="dash__card-avatar" aria-hidden>
                      {listing.deviceType.charAt(0)}
                    </div>
                    <div className="dash__card-info">
                      <span className="dash__card-title">{listing.title}</span>
                      <span className="dash__card-meta">
                        {listing.provider.name} · ★ {listing.averageRating.toFixed(1)}
                      </span>
                    </div>
                    <span className="dash__card-price">
                      ${listing.priceRange.min}
                      {listing.priceRange.max !== listing.priceRange.min
                        ? `–$${listing.priceRange.max}`
                        : ""}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {products.length > 0 && (
            <div className="search__group">
              <h2 className="plist__filter-title">Products</h2>
              <div className="dash__list">
                {products.map((product) => (
                  <Link
                    href={`/products/${product.id}`}
                    key={product.id}
                    className="dash__card dash__card--clickable"
                  >
                    <div className="dash__card-avatar" aria-hidden>
                      {product.brand.charAt(0)}
                    </div>
                    <div className="dash__card-info">
                      <span className="dash__card-title">{product.title}</span>
                      <span className="dash__card-meta">
                        {product.brand} · {product.seller.name}
                      </span>
                    </div>
                    <span className="dash__card-price">${product.price.toFixed(2)}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}
