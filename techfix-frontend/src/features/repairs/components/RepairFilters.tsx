"use client";

import type { RepairSearchFilters } from "@/features/repairs/types/repair.types";

const PRICE_BUCKETS: { label: string; minPrice?: number; maxPrice?: number }[] = [
  { label: "Under $50", maxPrice: 50 },
  { label: "$50 – $150", minPrice: 50, maxPrice: 150 },
  { label: "$150+", minPrice: 150 },
];

const RATING_BUCKETS = [4, 3];

interface RepairFiltersProps {
  filters: RepairSearchFilters;
  onChange: (filters: RepairSearchFilters) => void;
  onUseMyLocation: () => void;
  isLocating: boolean;
}

/**
 * Left-sidebar filter panel for repair search results — feature UI only.
 * Mirrors the design guide: filters always live in a sidebar, never chips.
 */
export default function RepairFilters({
  filters,
  onChange,
  onUseMyLocation,
  isLocating,
}: RepairFiltersProps) {
  function clearAll() {
    onChange({ q: filters.q });
  }

  function togglePriceBucket(bucket: (typeof PRICE_BUCKETS)[number]) {
    const isActive = filters.minPrice === bucket.minPrice && filters.maxPrice === bucket.maxPrice;
    onChange({
      ...filters,
      minPrice: isActive ? undefined : bucket.minPrice,
      maxPrice: isActive ? undefined : bucket.maxPrice,
    });
  }

  function toggleRating(rating: number) {
    onChange({ ...filters, minRating: filters.minRating === rating ? undefined : rating });
  }

  function toggleDistance(km?: number) {
    onChange({ ...filters, maxDistanceKm: filters.maxDistanceKm === km ? undefined : km });
  }

  function toggleServiceType(type: "pickup" | "dropoff" | "both") {
    onChange({ ...filters, serviceType: filters.serviceType === type ? undefined : type });
  }

  return (
    <aside className="repair-search__filters" aria-label="Repair search filters">
      <div className="repair-search__filters-header">
        <span className="repair-search__filters-title">Filters</span>
        <button type="button" className="repair-search__clear-btn" onClick={clearAll}>
          Clear all
        </button>
      </div>

      <div className="repair-search__filter-group">
        <span className="repair-search__filter-label">PRICE RANGE</span>
        {PRICE_BUCKETS.map((bucket) => (
          <label className="repair-search__checkbox-row" key={bucket.label}>
            <input
              type="checkbox"
              className="repair-search__checkbox"
              checked={filters.minPrice === bucket.minPrice && filters.maxPrice === bucket.maxPrice}
              onChange={() => togglePriceBucket(bucket)}
            />
            <span className="repair-search__checkbox-label">{bucket.label}</span>
          </label>
        ))}
      </div>

      <div className="repair-search__filter-divider" />

      <div className="repair-search__filter-group">
        <span className="repair-search__filter-label">MINIMUM RATING</span>
        {RATING_BUCKETS.map((rating) => (
          <label className="repair-search__checkbox-row" key={rating}>
            <input
              type="checkbox"
              className="repair-search__checkbox"
              checked={filters.minRating === rating}
              onChange={() => toggleRating(rating)}
            />
            <span className="repair-search__checkbox-label">{rating}+ Stars</span>
          </label>
        ))}
      </div>

      <div className="repair-search__filter-divider" />

      <div className="repair-search__filter-group">
        <span className="repair-search__filter-label">DISTANCE</span>
        {!filters.lat && (
          <button
            type="button"
            className="repair-search__location-btn"
            onClick={onUseMyLocation}
            disabled={isLocating}
          >
            {isLocating ? "Locating…" : "📍 Use My Location"}
          </button>
        )}
        {filters.lat && (
          <>
            <label className="repair-search__checkbox-row">
              <input
                type="checkbox"
                className="repair-search__checkbox"
                checked={filters.maxDistanceKm === 5}
                onChange={() => toggleDistance(5)}
              />
              <span className="repair-search__checkbox-label">Within 5 km</span>
            </label>
            <label className="repair-search__checkbox-row">
              <input
                type="checkbox"
                className="repair-search__checkbox"
                checked={filters.maxDistanceKm === 15}
                onChange={() => toggleDistance(15)}
              />
              <span className="repair-search__checkbox-label">Within 15 km</span>
            </label>
          </>
        )}
      </div>

      <div className="repair-search__filter-divider" />

      <div className="repair-search__filter-group">
        <span className="repair-search__filter-label">WARRANTY INCLUDED</span>
        <label className="repair-search__checkbox-row">
          <input
            type="checkbox"
            className="repair-search__checkbox"
            checked={!!filters.warrantyOnly}
            onChange={() => onChange({ ...filters, warrantyOnly: !filters.warrantyOnly })}
          />
          <span className="repair-search__checkbox-label">Warranty included only</span>
        </label>
      </div>

      <div className="repair-search__filter-divider" />

      <div className="repair-search__filter-group">
        <span className="repair-search__filter-label">SERVICE TYPE</span>
        {(["pickup", "dropoff", "both"] as const).map((type) => (
          <label className="repair-search__checkbox-row" key={type}>
            <input
              type="checkbox"
              className="repair-search__checkbox"
              checked={filters.serviceType === type}
              onChange={() => toggleServiceType(type)}
            />
            <span className="repair-search__checkbox-label">
              {type === "pickup" ? "Pickup" : type === "dropoff" ? "Drop-off" : "Both"}
            </span>
          </label>
        ))}
      </div>
    </aside>
  );
}
