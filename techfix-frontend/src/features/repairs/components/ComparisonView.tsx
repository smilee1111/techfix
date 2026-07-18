"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRepairCompare } from "@/features/repairs/hooks/useRepairCompare";

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

const ROWS = [
  { key: "price", label: "Price" },
  { key: "rating", label: "Rating" },
  { key: "time", label: "Est. Time" },
  { key: "distance", label: "Distance" },
  { key: "warranty", label: "Warranty" },
  { key: "availability", label: "Availability" },
] as const;

/**
 * Side-by-side repair provider comparison table — feature UI only.
 * Equal-width columns, max 3 providers, per the design guide.
 */
export default function ComparisonView() {
  const searchParams = useSearchParams();
  const ids = (searchParams.get("ids") ?? "").split(",").filter(Boolean);

  const { items, isLoading, error } = useRepairCompare(ids);

  if (isLoading) {
    return (
      <section className="comparison">
        <p style={{ color: "var(--color-text-muted)" }}>Loading comparison…</p>
      </section>
    );
  }

  if (error || items.length === 0) {
    return (
      <section className="comparison">
        <div className="fp__error" role="alert">
          {error ?? "Select at least 2 providers to compare."}
        </div>
        <Link href="/repairs" className="comparison__modify-link">
          ← Back to search
        </Link>
      </section>
    );
  }

  const bestId = items.reduce((a, b) => (b.averageRating > a.averageRating ? b : a)).id;

  function cellValue(row: (typeof ROWS)[number]["key"], item: (typeof items)[number]) {
    switch (row) {
      case "price":
        return `$${item.priceRange.min}`;
      case "rating":
        return `${item.averageRating.toFixed(1)} ★`;
      case "time":
        return item.repairOptions[0]?.estimatedTime ?? item.estimatedTime ?? "—";
      case "distance":
        return item.distanceKm !== undefined ? `${item.distanceKm.toFixed(1)} km` : "—";
      case "warranty":
        return item.warranty ?? "—";
      case "availability":
        return item.readyBy ?? "—";
    }
  }

  return (
    <section className="comparison" aria-labelledby="comparison-heading">
      <div className="comparison__head">
        <div className="comparison__head-text">
          <h1 id="comparison-heading" className="comparison__title">
            Compare Repair Shops
          </h1>
          <p className="comparison__subtitle">
            Comparing {items.length} providers for {items[0].deviceType} Repair
          </p>
        </div>
        <Link href="/repairs" className="comparison__modify-link">
          ← Modify Search
        </Link>
      </div>

      <div className="comparison__table">
        <div className="comparison__labels">
          <div className="comparison__provider-header" />
          {ROWS.map((row, i) => (
            <div
              key={row.key}
              className={`comparison__cell comparison__cell--label ${i % 2 === 0 ? "" : "comparison__cell--alt"}`}
            >
              {row.label}
            </div>
          ))}
          <div className="comparison__cta-cell" />
        </div>

        {items.map((item) => {
          const isBest = item.id === bestId;
          return (
            <div className="comparison__col" key={item.id}>
              <div
                className={`comparison__provider-header ${isBest ? "comparison__provider-header--best" : ""}`}
              >
                {isBest && <span className="comparison__best-tag">BEST MATCH</span>}
                <div
                  className={`comparison__provider-avatar ${isBest ? "comparison__provider-avatar--best" : ""}`}
                  aria-hidden
                >
                  {initials(item.provider.name)}
                </div>
                <p className="comparison__provider-name">{item.provider.name}</p>
                <p className="comparison__provider-tag">
                  {item.isVerified ? "TechFix Certified Partner" : "Independent Verified"}
                </p>
              </div>

              {ROWS.map((row, i) => (
                <div
                  key={row.key}
                  className={`comparison__cell comparison__cell--center ${i % 2 === 0 ? "" : "comparison__cell--alt"} ${
                    row.key === "price" ? "comparison__cell--price" : ""
                  } ${row.key === "rating" ? "comparison__cell--rating" : ""}`}
                >
                  {cellValue(row.key, item)}
                </div>
              ))}

              <div className="comparison__cta-cell">
                <Link
                  href={`/repairs/${item.id}`}
                  className={`comparison__book-btn ${isBest ? "comparison__book-btn--best" : ""}`}
                >
                  Book Now
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
