import Link from "next/link";
import type { RepairListing } from "@/features/repairs/types/repair.types";

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

interface RepairCardProps {
  repair: RepairListing;
  isTopPick?: boolean;
  isSelectedForCompare: boolean;
  onToggleCompare: (id: string) => void;
}

/**
 * Repair provider search-result card — feature UI only, zero business logic.
 * Always shows price, rating, distance/location, and readiness together
 * (Law of Proximity) plus a visible compare toggle.
 */
export default function RepairCard({
  repair,
  isTopPick,
  isSelectedForCompare,
  onToggleCompare,
}: RepairCardProps) {
  const fromPrice = repair.priceRange.min;

  return (
    <article className={`repair-card ${isSelectedForCompare ? "repair-card--selected" : ""}`}>
      <div className="repair-card__avatar" aria-hidden>
        {initials(repair.provider.name)}
      </div>

      <div className="repair-card__info">
        <div className="repair-card__name-row">
          <span className="repair-card__name">{repair.provider.name}</span>
          {isTopPick && <span className="repair-card__badge">TOP PICK</span>}
        </div>

        <div className="repair-card__rating-row">
          <span className="repair-card__rating">★ {repair.averageRating.toFixed(1)}</span>
          <span className="repair-card__location">
            ({repair.totalReviews} reviews) · {repair.location.address}
          </span>
        </div>

        <div className="repair-card__meta">
          {repair.distanceKm !== undefined && (
            <div className="repair-card__meta-item">
              <span className="repair-card__meta-label">DISTANCE</span>
              <span className="repair-card__meta-value">{repair.distanceKm.toFixed(1)} km</span>
            </div>
          )}
          <div className="repair-card__meta-item">
            <span className="repair-card__meta-label">FROM</span>
            <span className="repair-card__meta-value">${fromPrice}</span>
          </div>
          {repair.readyBy && (
            <div className="repair-card__meta-item">
              <span className="repair-card__meta-label">READY</span>
              <span className="repair-card__meta-value">{repair.readyBy}</span>
            </div>
          )}
        </div>
      </div>

      <div className="repair-card__actions">
        <Link href={`/repairs/${repair.id}`} className="repair-card__cta">
          View Details
        </Link>
        <label className="repair-card__compare-row">
          <input
            type="checkbox"
            checked={isSelectedForCompare}
            onChange={() => onToggleCompare(repair.id)}
          />
          Compare
        </label>
      </div>
    </article>
  );
}
