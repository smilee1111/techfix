"use client";

import { useState, useEffect, useCallback } from "react";
import { searchProducts, getBrands } from "@/features/products/api/productApi";
import type {
  Product,
  ProductSearchFilters,
  ProductSearchResult,
} from "@/features/products/types/product.types";

interface UseProductSearchReturn {
  items: Product[];
  pagination: ProductSearchResult["pagination"] | null;
  brands: string[];
  filters: ProductSearchFilters;
  isLoading: boolean;
  error: string | null;
  setFilters: (next: ProductSearchFilters) => void;
  patchFilters: (patch: Partial<ProductSearchFilters>) => void;
  goToPage: (page: number) => void;
}

const DEFAULT_FILTERS: ProductSearchFilters = { page: 1, limit: 12, sortBy: "newest" };

/**
 * Product discovery: filters, sorting and pagination in one place.
 * Calls productApi — never raw fetch.
 */
export function useProductSearch(
  initial: ProductSearchFilters = DEFAULT_FILTERS,
): UseProductSearchReturn {
  const [filters, setFiltersState] = useState<ProductSearchFilters>(initial);
  const [items, setItems] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<ProductSearchResult["pagination"] | null>(null);
  const [brands, setBrands] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Brand list is independent of the active filters, so it is fetched once
  // rather than on every filter change.
  useEffect(() => {
    let cancelled = false;
    getBrands()
      .then((result) => {
        if (!cancelled) setBrands(result);
      })
      .catch(() => {
        /* the brand filter is optional — a failure here shouldn't block results */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    searchProducts(filters)
      .then((result) => {
        if (cancelled) return;
        setItems(result.items);
        setPagination(result.pagination);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not load products");
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [filters]);

  const setFilters = useCallback((next: ProductSearchFilters) => {
    setFiltersState(next);
  }, []);

  // Any filter change resets to page 1 — staying on page 4 of a narrower
  // result set usually lands the user on an empty page.
  const patchFilters = useCallback((patch: Partial<ProductSearchFilters>) => {
    setFiltersState((prev) => ({ ...prev, ...patch, page: 1 }));
  }, []);

  const goToPage = useCallback((page: number) => {
    setFiltersState((prev) => ({ ...prev, page }));
  }, []);

  return {
    items,
    pagination,
    brands,
    filters,
    isLoading,
    error,
    setFilters,
    patchFilters,
    goToPage,
  };
}
