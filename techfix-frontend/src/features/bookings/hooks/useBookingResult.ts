"use client";

import { useState, useEffect } from "react";
import { getBookingById } from "@/features/bookings/api/bookingApi";
import { getValidAccessToken } from "@/lib/session";
import type { BookingResult } from "@/features/bookings/types/booking.types";

interface UseBookingResultReturn {
  booking: BookingResult | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Loads a confirmed booking by id for the success page.
 * Calls bookingApi.getBookingById — never raw fetch.
 */
export function useBookingResult(id: string): UseBookingResultReturn {
  const [booking, setBooking] = useState<BookingResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    getValidAccessToken()
      .then((token) => {
        if (!token) throw new Error("Please sign in to view this booking");
        return getBookingById(token, id);
      })
      .then((result) => {
        if (!cancelled) setBooking(result);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Could not load booking");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  return { booking, isLoading, error };
}
