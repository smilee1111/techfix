"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getBookingById,
  getBookingStatusHistory,
} from "@/features/bookings/api/bookingApi";
import { getValidAccessToken } from "@/lib/session";
import type { BookingDetail, StatusLogEntry } from "@/features/bookings/types/booking.types";

interface UseBookingDetailReturn {
  booking: BookingDetail | null;
  logs: StatusLogEntry[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Loads one booking together with its full repair-stage history.
 *
 * Both requests are issued in parallel off a single token read — the
 * timeline is meaningless without the booking and vice versa, so there's
 * no reason to waterfall them.
 * Calls bookingApi — never raw fetch.
 */
export function useBookingDetail(id: string): UseBookingDetailReturn {
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [logs, setLogs] = useState<StatusLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    getValidAccessToken()
      .then((token) => {
        if (!token) throw new Error("Please sign in to view this repair");
        return Promise.all([getBookingById(token, id), getBookingStatusHistory(token, id)]);
      })
      .then(([bookingResult, logResult]) => {
        if (cancelled) return;
        setBooking(bookingResult);
        setLogs(logResult);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not load this repair");
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, refreshKey]);

  const refetch = useCallback(() => setRefreshKey((k) => k + 1), []);

  return { booking, logs, isLoading, error, refetch };
}
