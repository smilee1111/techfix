"use client";

import { useState, useEffect, useCallback } from "react";
import { getIncomingBookings, updateBookingStatus } from "@/features/bookings/api/bookingApi";
import { getValidAccessToken } from "@/lib/session";
import type { BookingListItem, RepairStage } from "@/features/bookings/types/booking.types";

interface UseIncomingBookingsReturn {
  items: BookingListItem[];
  isLoading: boolean;
  error: string | null;
  updatingId: string | null;
  advanceStage: (bookingId: string, stage: RepairStage) => Promise<void>;
}

/**
 * Loads bookings against the logged-in seller's own listings, and lets
 * them advance a booking's repair stage.
 * Calls bookingApi — never raw fetch.
 */
export function useIncomingBookings(): UseIncomingBookingsReturn {
  const [items, setItems] = useState<BookingListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    getValidAccessToken()
      .then((token) => {
        if (!token) throw new Error("Please sign in to view incoming bookings");
        return getIncomingBookings(token);
      })
      .then((result) => {
        if (!cancelled) setItems(result);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Could not load incoming bookings");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const advanceStage = useCallback(async (bookingId: string, stage: RepairStage) => {
    setUpdatingId(bookingId);
    setError(null);
    try {
      const token = await getValidAccessToken();
      if (!token) throw new Error("Please sign in");
      const updated = await updateBookingStatus(token, bookingId, stage);
      setItems((prev) => prev.map((item) => (item.id === bookingId ? updated : item)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update booking status");
    } finally {
      setUpdatingId(null);
    }
  }, []);

  return { items, isLoading, error, updatingId, advanceStage };
}
