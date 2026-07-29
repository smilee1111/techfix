"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createEstimate } from "@/features/estimate/api/estimateApi";
import type { EstimateRequest } from "@/features/estimate/types/estimate.types";

interface UseEstimateReturn {
  isLoading: boolean;
  error: string | null;
  submit: (request: EstimateRequest) => Promise<void>;
}

/**
 * Submits an estimate request and redirects to the results page on success.
 * Calls estimateApi.createEstimate — never raw fetch.
 */
export function useEstimate(): UseEstimateReturn {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(
    async (request: EstimateRequest) => {
      setIsLoading(true);
      setError(null);
      try {
        const estimate = await createEstimate(request);
        router.push(`/estimate/results/${estimate.id}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not calculate estimate");
      } finally {
        setIsLoading(false);
      }
    },
    [router],
  );

  return { isLoading, error, submit };
}
