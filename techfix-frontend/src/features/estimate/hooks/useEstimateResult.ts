"use client";

import { useState, useEffect } from "react";
import { getEstimateById } from "@/features/estimate/api/estimateApi";
import type { EstimateResult } from "@/features/estimate/types/estimate.types";

interface UseEstimateResultReturn {
  estimate: EstimateResult | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Loads a previously calculated estimate by id.
 * Calls estimateApi.getEstimateById — never raw fetch.
 */
export function useEstimateResult(id: string): UseEstimateResultReturn {
  const [estimate, setEstimate] = useState<EstimateResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    getEstimateById(id)
      .then((result) => {
        if (!cancelled) setEstimate(result);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Could not load estimate");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  return { estimate, isLoading, error };
}
