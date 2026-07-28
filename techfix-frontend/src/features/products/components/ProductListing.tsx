"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useProductSearch } from "@/features/products/hooks/useProductSearch";
import { useCategories } from "@/features/categories/hooks/useCategories";
import ProductCard from "@/features/products/components/ProductCard";
import {
  CONDITION_LABELS,
  PRODUCT_SORT_OPTIONS,
  type ProductCondition,
  type ProductSortBy,
} from "@/features/products/types/product.types";

const MAX_COMPARE = 3;

/**
 * Product discovery — feature UI only.
 *
 * Mirrors the repair search layout deliberately: a shopper who has already
 * used the repair side should not have to learn a second pattern
 * (Jakob's Law, applied internally).
 */
export default function ProductListing() {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const { items, pagination, brands, filters, isLoading, error, patchFilters, goToPage } =
    useProductSearch();
  const { categories } = useCategories("product");

  function toggleCompare(id: string) {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((p) => p !== id);
      // Capped at 3, same as repair comparison (Miller's Law).
      if (prev.length >= MAX_COMPARE) return prev;
      return [...prev, id];
    });
  }

  function submitSearch(event: React.FormEvent) {
    event.preventDefault();
    patchFilters({ q: search.trim() || undefined });
  }

  return (
    <section className="plist" aria-labelledby="products-heading">
      <div className="plist__head">
        <div>
          <h1 id="products-heading" className="plist__title">
            Tech Products
          </h1>
          <p className="plist__subtitle">
            Genuine parts and certified devices from verified sellers.
          </p>
        </div>

        <form className="plist__search" onSubmit={submitSearch} role="search">
          <input
            className="plist__search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products, brands…"
            aria-label="Search products"
          />
          <button type="submit" className="plist__search-btn">
            Search
          </button>
        </form>
      </div>

      <div className="plist__body">
        {/* ── Filters ─────────────────────────────────────────────── */}
        <aside className="plist__filters" aria-label="Product filters">
          <div className="plist__filter-group">
            <h2 className="plist__filter-title">Category</h2>
            <select
              className="lform__input"
              value={filters.category ?? ""}
              onChange={(e) => patchFilters({ category: e.target.value || undefined })}
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="plist__filter-group">
            <h2 className="plist__filter-title">Brand</h2>
            <select
              className="lform__input"
              value={filters.brand ?? ""}
              onChange={(e) => patchFilters({ brand: e.target.value || undefined })}
            >
              <option value="">All brands</option>
              {brands.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          <div className="plist__filter-group">
            <h2 className="plist__filter-title">Condition</h2>
            {(Object.keys(CONDITION_LABELS) as ProductCondition[]).map((value) => (
              <label className="lform__check" key={value}>
                <input
                  type="radio"
                  name="condition"
                  checked={filters.condition === value}
                  onChange={() => patchFilters({ condition: value })}
                />
                <span>{CONDITION_LABELS[value]}</span>
              </label>
            ))}
            <button
              type="button"
              className="lform__add"
              onClick={() => patchFilters({ condition: undefined })}
            >
              Clear condition
            </button>
          </div>

          <div className="plist__filter-group">
            <h2 className="plist__filter-title">Price</h2>
            <div className="plist__price-row">
              <input
                className="lform__input"
                type="number"
                min="0"
                placeholder="Min"
                value={filters.minPrice ?? ""}
                onChange={(e) =>
                  patchFilters({
                    minPrice: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                aria-label="Minimum price"
              />
              <input
                className="lform__input"
                type="number"
                min="0"
                placeholder="Max"
                value={filters.maxPrice ?? ""}
                onChange={(e) =>
                  patchFilters({
                    maxPrice: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                aria-label="Maximum price"
              />
            </div>
          </div>

          <div className="plist__filter-group">
            <h2 className="plist__filter-title">Trust</h2>
            <label className="lform__check">
              <input
                type="checkbox"
                checked={!!filters.verifiedOnly}
                onChange={(e) => patchFilters({ verifiedOnly: e.target.checked || undefined })}
              />
              <span>Verified products only</span>
            </label>
            <label className="lform__check">
              <input
                type="checkbox"
                checked={!!filters.inStockOnly}
                onChange={(e) => patchFilters({ inStockOnly: e.target.checked || undefined })}
              />
              <span>In stock only</span>
            </label>
          </div>
        </aside>

        {/* ── Results ─────────────────────────────────────────────── */}
        <div className="plist__results">
          <div className="plist__toolbar">
            <span className="plist__count">
              {pagination ? `${pagination.totalItems} products` : "…"}
            </span>
            <select
              className="dash__stage-select"
              value={filters.sortBy ?? "newest"}
              onChange={(e) => patchFilters({ sortBy: e.target.value as ProductSortBy })}
              aria-label="Sort products"
            >
              {PRODUCT_SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div className="fp__error" role="alert">
              {error}
            </div>
          )}

          {isLoading ? (
            <p style={{ color: "var(--color-text-muted)" }}>Loading products…</p>
          ) : items.length === 0 ? (
            <p className="dash__empty">
              No products match those filters — try widening your price range.
            </p>
          ) : (
            <div className="plist__grid">
              {items.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isSelected={selected.includes(product.id)}
                  onToggleCompare={toggleCompare}
                />
              ))}
            </div>
          )}

          {pagination && pagination.totalPages > 1 && (
            <div className="plist__pager">
              <button
                type="button"
                className="dash__card-view"
                disabled={!pagination.hasPrev}
                onClick={() => goToPage(pagination.currentPage - 1)}
              >
                Previous
              </button>
              <span className="plist__pager-label">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <button
                type="button"
                className="dash__card-view"
                disabled={!pagination.hasNext}
                onClick={() => goToPage(pagination.currentPage + 1)}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Compare tray — only appears once a comparison is possible. */}
      {selected.length > 0 && (
        <div className="plist__tray" role="region" aria-label="Comparison tray">
          <span className="plist__tray-count">
            {selected.length} selected {selected.length < 2 && "— pick one more to compare"}
          </span>
          <div className="plist__tray-actions">
            <button type="button" className="lform__cancel" onClick={() => setSelected([])}>
              Clear
            </button>
            <button
              type="button"
              className="lform__submit"
              disabled={selected.length < 2}
              onClick={() => router.push(`/products/compare?ids=${selected.join(",")}`)}
            >
              Compare {selected.length}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
