"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/features/categories/api/categoryApi";
import { getValidAccessToken } from "@/lib/session";
import type { Category, CategoryInput } from "@/features/categories/types/category.types";

interface UseAdminCategoriesReturn {
  categories: Category[];
  isLoading: boolean;
  error: string | null;
  isSubmitting: boolean;
  deletingId: string | null;
  save: (input: CategoryInput, editingId?: string) => Promise<boolean>;
  remove: (id: string) => Promise<void>;
  clearError: () => void;
}

/**
 * Category CRUD for the admin panel.
 *
 * Unlike useCategories (public, read-only, used by the listing form), every
 * write here needs a bearer token, so this hook owns both sides.
 * Calls categoryApi — never raw fetch.
 */
export function useAdminCategories(): UseAdminCategoriesReturn {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    getCategories()
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
  }, [refreshKey]);

  const save = useCallback(async (input: CategoryInput, editingId?: string) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const token = await getValidAccessToken();
      if (!token) throw new Error("Please sign in as an admin");

      if (editingId) {
        // `type` is intentionally not sent — the backend's update DTO omits
        // it, since listings already reference this side of the taxonomy.
        await updateCategory(token, editingId, {
          name: input.name,
          description: input.description,
          icon: input.icon,
        });
      } else {
        await createCategory(token, input);
      }
      setRefreshKey((k) => k + 1);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save category");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const remove = useCallback(async (id: string) => {
    setDeletingId(id);
    setError(null);
    try {
      const token = await getValidAccessToken();
      if (!token) throw new Error("Please sign in as an admin");
      await deleteCategory(token, id);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete category");
    } finally {
      setDeletingId(null);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return {
    categories,
    isLoading,
    error,
    isSubmitting,
    deletingId,
    save,
    remove,
    clearError,
  };
}
