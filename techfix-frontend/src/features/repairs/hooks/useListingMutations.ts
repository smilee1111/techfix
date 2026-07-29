"use client";

import { useState, useCallback } from "react";
import {
  createRepairListing,
  updateRepairListing,
  setRepairListingActive,
} from "@/features/repairs/api/repairApi";
import { getValidAccessToken } from "@/lib/session";
import type { RepairListingInput } from "@/features/repairs/types/repair.types";

interface UseListingMutationsReturn {
  isSubmitting: boolean;
  togglingId: string | null;
  error: string | null;
  /** Resolves true on success so the caller can close its form. */
  save: (input: RepairListingInput, editingId?: string) => Promise<boolean>;
  toggleActive: (id: string, isActive: boolean) => Promise<boolean>;
  clearError: () => void;
}

/**
 * Write operations for the seller's own repair listings.
 *
 * Kept separate from useMyListings (which owns the read) so the dashboard can
 * re-fetch after a successful write without this hook holding list state too.
 * Calls repairApi — never raw fetch.
 */
export function useListingMutations(): UseListingMutationsReturn {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const save = useCallback(async (input: RepairListingInput, editingId?: string) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const token = await getValidAccessToken();
      if (!token) throw new Error("Please sign in to manage your listings");

      if (editingId) {
        await updateRepairListing(token, editingId, input);
      } else {
        await createRepairListing(token, input);
      }
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save listing");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const toggleActive = useCallback(async (id: string, isActive: boolean) => {
    setTogglingId(id);
    setError(null);
    try {
      const token = await getValidAccessToken();
      if (!token) throw new Error("Please sign in to manage your listings");
      await setRepairListingActive(token, id, isActive);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update listing status");
      return false;
    } finally {
      setTogglingId(null);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return { isSubmitting, togglingId, error, save, toggleActive, clearError };
}
