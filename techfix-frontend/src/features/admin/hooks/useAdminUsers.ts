"use client";

import { useState, useEffect, useCallback } from "react";
import { getUsers, setSellerVerified } from "@/features/admin/api/adminApi";
import { getValidAccessToken } from "@/lib/session";
import type { AdminUser, UserRole } from "@/features/admin/types/admin.types";

interface UseAdminUsersReturn {
  users: AdminUser[];
  isLoading: boolean;
  error: string | null;
  updatingId: string | null;
  toggleSellerVerified: (user: AdminUser) => Promise<void>;
}

/**
 * The admin panel's user directory plus the seller-verification action.
 *
 * Read and write live together here (unlike the seller listings hooks)
 * because the write only ever flips one boolean on a row already in this
 * list — so it patches state in place instead of re-fetching everything.
 * Calls adminApi — never raw fetch.
 */
export function useAdminUsers(role?: UserRole): UseAdminUsersReturn {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    getValidAccessToken()
      .then((token) => {
        if (!token) throw new Error("Please sign in as an admin");
        return getUsers(token, role);
      })
      .then((result) => {
        if (!cancelled) setUsers(result);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not load users");
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [role]);

  const toggleSellerVerified = useCallback(async (user: AdminUser) => {
    setUpdatingId(user.id);
    setError(null);
    try {
      const token = await getValidAccessToken();
      if (!token) throw new Error("Please sign in as an admin");
      const updated = await setSellerVerified(token, user.id, !user.isVerifiedSeller);
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update seller verification");
    } finally {
      setUpdatingId(null);
    }
  }, []);

  return { users, isLoading, error, updatingId, toggleSellerVerified };
}
