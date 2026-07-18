"use client";

import { useState, useEffect } from "react";
import { compareRepairs } from "@/features/repairs/api/repairApi";
import type { RepairListing } from "@/features/repairs/types/repair.types";

interface UseRepairCompareReturn {
  items: RepairListing[];
  isLoading: boolean;
  error: string | null;
}

/**
 * Loads 2–3 repair service listings for side-by-side comparison.
 * Calls repairApi.compareRepairs — never raw fetch.
 */
export function useRepairCompare(ids: string[]): UseRepairCompareReturn {
  const [items, setItems] = useState<RepairListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const idsKey = ids.join(",");

  useEffect(() => {
    if (!idsKey) {
      setIsLoading(false);
      setError("Select at least 2 providers to compare");
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    compareRepairs(idsKey.split(","))
      .then((result) => {
        if (!cancelled) setItems(result);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Could not load comparison");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [idsKey]);

  return { items, isLoading, error };
}
