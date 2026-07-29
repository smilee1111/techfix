"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useProductCompare } from "@/features/products/hooks/useProductCompare";
import {
  CONDITION_LABELS,
  AUTHENTICITY_LABELS,
  type Product,
} from "@/features/products/types/product.types";

/** Scores a listing so the table can call out one column as the best pick. */
function valueScore(product: Product): number {
  const checks = product.authenticityChecks;
  const checkRatio = checks.length ? checks.filter((c) => c.passed).length / checks.length : 0;
  // Rating and verified authenticity carry the most weight; price breaks ties.
  return (
    product.averageRating * 2 +
    checkRatio * 3 +
    (product.isVerified ? 2 : 0) +
    (product.seller.isVerifiedSeller ? 1 : 0) -
    product.price / 100
  );
}

/**
 * Side-by-side seller comparison — feature UI only.
 *
 * Highlights a recommended column rather than leaving the shopper to weigh
 * five variables themselves (Cognitive Load Theory); the score is shown as
 * a plain "Best match" badge rather than a number, since an unexplained
 * score invites more questions than it answers.
 */
export default function CompareSellers() {
  const searchParams = useSearchParams();
  const ids = (searchParams.get("ids") ?? "").split(",").filter(Boolean);
  const { items, isLoading, error } = useProductCompare(ids);

  if (isLoading) {
    return (
      <section className="pcompare">
        <p style={{ color: "var(--color-text-muted)" }}>Loading comparison…</p>
      </section>
    );
  }

  if (error || items.length === 0) {
    return (
      <section className="pcompare">
        <div className="fp__error" role="alert">
          {error ?? "Nothing to compare."}
        </div>
        <Link href="/products" className="bdetail__back">
          ← Back to Products
        </Link>
      </section>
    );
  }

  const bestId = items.reduce((best, item) =>
    valueScore(item) > valueScore(best) ? item : best,
  ).id;

  const rows: { label: string; render: (p: Product) => React.ReactNode }[] = [
    { label: "Seller", render: (p) => `${p.seller.name}${p.seller.isVerifiedSeller ? " ✓" : ""}` },
    { label: "Price", render: (p) => `$${p.price.toFixed(2)}` },
    { label: "Condition", render: (p) => CONDITION_LABELS[p.condition] },
    { label: "Authenticity", render: (p) => AUTHENTICITY_LABELS[p.authenticityLabel] },
    {
      label: "Checks passed",
      render: (p) =>
        p.authenticityChecks.length
          ? `${p.authenticityChecks.filter((c) => c.passed).length} / ${p.authenticityChecks.length}`
          : "—",
    },
    { label: "Rating", render: (p) => `★ ${p.averageRating.toFixed(1)} (${p.totalReviews})` },
    { label: "Warranty", render: (p) => p.warranty ?? "—" },
    { label: "Stock", render: (p) => (p.stock === 0 ? "Out of stock" : `${p.stock}`) },
    { label: "Location", render: (p) => p.city },
  ];

  return (
    <section className="pcompare" aria-labelledby="compare-heading">
      <Link href="/products" className="bdetail__back">
        ← Back to Products
      </Link>

      <div className="dash__head">
        <h1 id="compare-heading" className="dash__title">
          Compare Sellers
        </h1>
        <p className="dash__subtitle">
          {items.length} products side by side, with the best overall match highlighted.
        </p>
      </div>

      <div className="pcompare__scroll">
        <table className="pcompare__table">
          <thead>
            <tr>
              <th scope="col">Detail</th>
              {items.map((item) => (
                <th
                  key={item.id}
                  scope="col"
                  className={item.id === bestId ? "pcompare__col--best" : ""}
                >
                  <span className="pcompare__product">{item.title}</span>
                  <span className="pcard__brand">{item.brand}</span>
                  {item.id === bestId && <span className="pcard__verified">Best match</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label}>
                <th scope="row">{row.label}</th>
                {items.map((item) => (
                  <td
                    key={item.id}
                    className={item.id === bestId ? "pcompare__col--best" : ""}
                  >
                    {row.render(item)}
                  </td>
                ))}
              </tr>
            ))}
            <tr>
              <th scope="row">&nbsp;</th>
              {items.map((item) => (
                <td key={item.id} className={item.id === bestId ? "pcompare__col--best" : ""}>
                  <Link href={`/products/${item.id}`} className="dash__card-view">
                    View
                  </Link>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
