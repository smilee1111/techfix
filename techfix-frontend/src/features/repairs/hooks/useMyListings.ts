"use client";

import { useState, useEffect, useCallback } from "react";
import { getMyRepairListings } from "@/features/repairs/api/repairApi";
import { getValidAccessToken } from "@/lib/session";
import type { RepairListing } from "@/features/repairs/types/repair.types";

interface UseMyListingsReturn {
  items: RepairListing[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Loads the logged-in seller's own repair-service listings.
 * Calls repairApi.getMyRepairListings — never raw fetch.
 */
export function useMyListings(): UseMyListingsReturn {
  const [items, setItems] = useState<RepairListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    getValidAccessToken()
      .then((token) => {
        if (!token) throw new Error("Please sign in to view your listings");
        return getMyRepairListings(token);
      })
      .then((result) => {
        if (!cancelled) setItems(result);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Could not load your listings");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const refetch = useCallback(() => setRefreshKey((k) => k + 1), []);

  return { items, isLoading, error, refetch };
}
