"use client";

import { useState, useEffect } from "react";
import { getCategories } from "@/features/categories/api/categoryApi";
import type { Category, CategoryType } from "@/features/categories/types/category.types";

interface UseCategoriesReturn {
  categories: Category[];
  isLoading: boolean;
  error: string | null;
}

/**
 * Loads the category taxonomy, optionally filtered to one side.
 * Calls categoryApi.getCategories — never raw fetch.
 */
export function useCategories(type?: CategoryType): UseCategoriesReturn {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    getCategories(type)
      .then((result) => {
        if (!cancelled) setCategories(result);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not load categories");
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [type]);

  return { categories, isLoading, error };
}
