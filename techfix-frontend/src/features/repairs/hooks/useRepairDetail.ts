"use client";

import { useState, useEffect } from "react";
import { getRepairById } from "@/features/repairs/api/repairApi";
import type { RepairListing } from "@/features/repairs/types/repair.types";

interface UseRepairDetailReturn {
  repair: RepairListing | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Loads a single repair service listing by id.
 * Calls repairApi.getRepairById — never raw fetch.
 */
export function useRepairDetail(id: string): UseRepairDetailReturn {
  const [repair, setRepair] = useState<RepairListing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    getRepairById(id)
      .then((result) => {
        if (!cancelled) setRepair(result);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Could not load listing");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  return { repair, isLoading, error };
}
