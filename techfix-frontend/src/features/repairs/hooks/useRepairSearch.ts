"use client";

import { useState, useEffect, useCallback } from "react";
import { searchRepairs } from "@/features/repairs/api/repairApi";
import type {
  RepairListing,
  RepairSearchFilters,
  RepairSearchResult,
} from "@/features/repairs/types/repair.types";

interface UseRepairSearchReturn {
  items: RepairListing[];
  pagination: RepairSearchResult["pagination"] | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Runs a repair-service search whenever the filters change.
 * Calls repairApi.searchRepairs — never raw fetch.
 */
export function useRepairSearch(filters: RepairSearchFilters): UseRepairSearchReturn {
  const [items, setItems] = useState<RepairListing[]>([]);
  const [pagination, setPagination] = useState<RepairSearchResult["pagination"] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filtersKey = JSON.stringify(filters);

  const runSearch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await searchRepairs(JSON.parse(filtersKey));
      setItems(result.items);
      setPagination(result.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load repair services");
    } finally {
      setIsLoading(false);
    }
    // filtersKey is a stable serialization of `filters`; safe to depend on it alone.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersKey]);

  useEffect(() => {
    runSearch();
  }, [runSearch]);

  return { items, pagination, isLoading, error };
}
