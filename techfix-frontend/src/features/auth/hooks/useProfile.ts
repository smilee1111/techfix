"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, updateProfile as updateProfileApi } from "@/features/auth/api/authApi";
import { getAuthToken } from "@/lib/cookie";
import type { AccountProfile } from "@/features/auth/types/auth.types";

interface UseProfileReturn {
  profile: AccountProfile | null;
  isLoading: boolean;
  error: string | null;
  updateProfile: (updates: { name?: string; phone?: string }) => Promise<void>;
  isSaving: boolean;
}

/**
 * Loads and updates the logged-in user's account profile.
 * Redirects to /login if no access token is present.
 */
export function useProfile(): UseProfileReturn {
  const router = useRouter();
  const [profile, setProfile] = useState<AccountProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    getAuthToken().then((token) => {
      if (cancelled) return;
      if (!token) {
        router.push("/login");
        return;
      }

      getCurrentUser(token)
        .then((result) => {
          if (!cancelled) setProfile(result);
        })
        .catch((err) => {
          if (!cancelled) setError(err instanceof Error ? err.message : "Could not load profile");
        })
        .finally(() => {
          if (!cancelled) setIsLoading(false);
        });
    });

    return () => {
      cancelled = true;
    };
  }, [router]);

  const updateProfile = useCallback(async (updates: { name?: string; phone?: string }) => {
    const token = await getAuthToken();
    if (!token) return;

    setIsSaving(true);
    setError(null);
    try {
      const updated = await updateProfileApi(token, updates);
      setProfile(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update profile");
    } finally {
      setIsSaving(false);
    }
  }, []);

  return { profile, isLoading, error, updateProfile, isSaving };
}
