"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useRepairSearch } from "@/features/repairs/hooks/useRepairSearch";
import RepairCard from "@/features/repairs/components/RepairCard";
import RepairFilters from "@/features/repairs/components/RepairFilters";
import type { RepairSearchFilters } from "@/features/repairs/types/repair.types";

const MAX_COMPARE = 3;

/**
 * Repair search results page content — feature UI only.
 * Composes the sidebar filters, sort bar, and result cards.
 */
export default function RepairSearchResults() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";

  const [filters, setFilters] = useState<RepairSearchFilters>({ q: initialQuery, limit: 10 });
  const [isLocating, setIsLocating] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);

  const { items, pagination, isLoading, error } = useRepairSearch(filters);
  const topRatedId = items.length > 0 ? items.reduce((a, b) => (b.averageRating > a.averageRating ? b : a)).id : null;

  function handleUseMyLocation() {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFilters((prev) => ({
          ...prev,
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          sortBy: "closest",
        }));
        setIsLocating(false);
      },
      () => setIsLocating(false),
    );
  }

  function toggleCompare(id: string) {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= MAX_COMPARE) return prev;
      return [...prev, id];
    });
  }

  return (
    <section className="repair-search" aria-labelledby="repair-search-heading">
      <div className="repair-search__head">
        <h1 id="repair-search-heading" className="repair-search__title">
          {filters.q ? `Repair Shops for "${filters.q}"` : "All Repair Shops"}
        </h1>
        <p className="repair-search__subtitle">
          {pagination
            ? `${pagination.totalItems} verified shops available near Kathmandu`
            : "Searching…"}
        </p>
      </div>

      <div className="repair-search__body">
        <RepairFilters
          filters={filters}
          onChange={setFilters}
          onUseMyLocation={handleUseMyLocation}
          isLocating={isLocating}
        />

        <div className="repair-search__results">
          <div className="repair-search__sort-bar">
            <span className="repair-search__count">
              {pagination ? `${pagination.totalItems} repair shops found` : ""}
            </span>
            <div className="repair-search__sort-right">
              <span className="repair-search__sort-label">Sort by:</span>
              <select
                className="repair-search__sort-select"
                value={filters.sortBy ?? "rating"}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, sortBy: e.target.value as RepairSearchFilters["sortBy"] }))
                }
              >
                {filters.lat && <option value="closest">Closest first</option>}
                <option value="rating">Highest rated</option>
                <option value="price">Lowest price</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="fp__error" role="alert">
              {error}
            </div>
          )}

          {isLoading ? (
            <p style={{ color: "var(--color-text-muted)" }}>Loading repair shops…</p>
          ) : items.length === 0 ? (
            <p style={{ color: "var(--color-text-muted)" }}>
              No repair shops matched your search. Try adjusting your filters or{" "}
              <a href="/help" style={{ color: "var(--color-action-secondary)" }}>
                contact support
              </a>
              .
            </p>
          ) : (
            <div className="repair-search__list">
              {items.map((repair) => (
                <RepairCard
                  key={repair.id}
                  repair={repair}
                  isTopPick={repair.id === topRatedId}
                  isSelectedForCompare={selected.includes(repair.id)}
                  onToggleCompare={toggleCompare}
                />
              ))}
            </div>
          )}

          {selected.length >= 2 && (
            <div className="repair-search__compare-bar">
              <span className="repair-search__compare-text">
                {selected.length} selected for comparison
              </span>
              <button
                type="button"
                className="repair-search__compare-btn"
                onClick={() => router.push(`/repairs/compare?ids=${selected.join(",")}`)}
              >
                Compare Now
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
