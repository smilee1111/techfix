"use client";

import { useState, useEffect, useCallback } from "react";
import { getMyBookings } from "@/features/bookings/api/bookingApi";
import { getValidAccessToken } from "@/lib/session";
import type { BookingListItem } from "@/features/bookings/types/booking.types";

interface UseMyBookingsReturn {
  items: BookingListItem[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Loads the logged-in customer's own bookings for "My Repairs".
 * Calls bookingApi.getMyBookings — never raw fetch.
 */
export function useMyBookings(): UseMyBookingsReturn {
  const [items, setItems] = useState<BookingListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    getValidAccessToken()
      .then((token) => {
        if (!token) throw new Error("Please sign in to view your repairs");
        return getMyBookings(token);
      })
      .then((result) => {
        if (!cancelled) setItems(result);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Could not load your repairs");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const refetch = useCallback(() => setRefreshKey((k) => k + 1), []);

  return { items, isLoading, error, refetch };
}
