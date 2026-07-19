"use client";

import Link from "next/link";
import { useEstimateResult } from "@/features/estimate/hooks/useEstimateResult";

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

interface EstimateResultProps {
  id: string;
}

/**
 * Price estimate results page content — feature UI only.
 * Shows the calculated range, a shop-by-shop breakdown, and lets the
 * user jump straight into booking with any matched provider.
 */
export default function EstimateResult({ id }: EstimateResultProps) {
  const { estimate, isLoading, error } = useEstimateResult(id);

  if (isLoading) {
    return (
      <section className="estimate-result">
        <p style={{ color: "var(--color-text-muted)" }}>Loading your estimate…</p>
      </section>
    );
  }

  if (error || !estimate) {
    return (
      <section className="estimate-result">
        <div className="fp__error" role="alert">
          {error ?? "This estimate could not be found."}
        </div>
      </section>
    );
  }

  return (
    <section className="estimate-result" aria-labelledby="estimate-result-heading">
      <div className="estimate-result__head">
        <h1 id="estimate-result-heading" className="estimate-result__title">
          Price Estimate Results
        </h1>
        <p className="estimate-result__subtitle">
          {estimate.brand} {estimate.deviceModel} — {estimate.issueType} · {estimate.city}
        </p>
      </div>

      <div className="estimate-result__body">
        <div className="estimate-result__left">
          <div className="estimate-result__range-card">
            <span className="estimate-result__range-label">ESTIMATED REPAIR COST</span>

            {estimate.matchedShopsCount === 0 ? (
              <>
                <p style={{ color: "var(--color-text-primary)", fontSize: 16 }}>
                  No shops currently list this exact repair — try a nearby city or{" "}
                  <Link href="/help" style={{ color: "var(--color-action-secondary)" }}>
                    contact support
                  </Link>{" "}
                  for a custom quote.
                </p>
                <Link href="/repairs" className="estimate-form__btn-primary" style={{ textDecoration: "none", textAlign: "center", display: "block" }}>
                  Browse Repair Shops
                </Link>
              </>
            ) : (
              <>
                <div className="estimate-result__range-row">
                  <span className="estimate-result__range-min">${estimate.estimatedMin}</span>
                  <span className="estimate-result__range-to">to</span>
                  <span className="estimate-result__range-max">${estimate.estimatedMax}</span>
                </div>
                <p className="estimate-result__range-note">
                  Based on {estimate.matchedShopsCount} verified shops in your area
                </p>
                <div className="estimate-result__divider" />
                <div className="estimate-result__factors">
                  <div className="estimate-result__factor">
                    <span className="estimate-result__factor-label">DEVICE</span>
                    <span className="estimate-result__factor-value">
                      {estimate.brand} {estimate.deviceModel}
                    </span>
                  </div>
                  <div className="estimate-result__factor">
                    <span className="estimate-result__factor-label">ISSUE</span>
                    <span className="estimate-result__factor-value">{estimate.issueType}</span>
                  </div>
                  <div className="estimate-result__factor">
                    <span className="estimate-result__factor-label">LOCATION</span>
                    <span className="estimate-result__factor-value">{estimate.city}</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {estimate.topMatches.length > 0 && (
            <>
              <p className="estimate-result__section-title">Shop-by-Shop Breakdown</p>
              {estimate.topMatches.map((match) => (
                <div className="estimate-result__shop-row" key={match.repairServiceId}>
                  <div className="estimate-result__shop-avatar" aria-hidden>
                    {initials(match.providerName)}
                  </div>
                  <div className="estimate-result__shop-info">
                    <span className="estimate-result__shop-name">{match.providerName}</span>
                    <span className="estimate-result__shop-rating">★ {match.averageRating.toFixed(1)}</span>
                  </div>
                  <span className="estimate-result__shop-price">${match.price}</span>
                  <Link href={`/repairs/${match.repairServiceId}`} className="estimate-result__shop-btn">
                    Book →
                  </Link>
                </div>
              ))}
            </>
          )}
        </div>

        <aside className="estimate-result__sidebar" aria-label="Refine estimate">
          <p className="estimate-result__sidebar-title">Want a different estimate?</p>
          <Link href="/estimate" className="estimate-form__btn-secondary" style={{ textDecoration: "none", textAlign: "center", display: "block" }}>
            Start a New Estimate
          </Link>
        </aside>
      </div>
    </section>
  );
}
