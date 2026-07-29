"use client";

import { useState, useEffect } from "react";
import { compareProducts } from "@/features/products/api/productApi";
import type { Product } from "@/features/products/types/product.types";

interface UseProductCompareReturn {
  items: Product[];
  isLoading: boolean;
  error: string | null;
}

/**
 * Loads 2–3 products for side-by-side seller comparison.
 * Mirrors useRepairCompare — same cap, same contract.
 * Calls productApi.compareProducts — never raw fetch.
 */
export function useProductCompare(ids: string[]): UseProductCompareReturn {
  const [items, setItems] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const idsKey = ids.join(",");

  useEffect(() => {
    if (!idsKey) {
      setIsLoading(false);
      setError("Select at least 2 products to compare");
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    compareProducts(idsKey.split(","))
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
