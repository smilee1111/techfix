"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createBooking } from "@/features/bookings/api/bookingApi";
import { getValidAccessToken } from "@/lib/session";
import type { BookingRequest } from "@/features/bookings/types/booking.types";

interface UseBookingReturn {
  isLoading: boolean;
  error: string | null;
  submit: (request: BookingRequest) => Promise<void>;
}

/**
 * Submits a booking and redirects to the success page on confirmation.
 * Calls bookingApi.createBooking — never raw fetch.
 */
export function useBooking(): UseBookingReturn {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(
    async (request: BookingRequest) => {
      setIsLoading(true);
      setError(null);
      try {
        const token = await getValidAccessToken();
        if (!token) {
          router.push(`/login?next=/repairs/${request.repairService}`);
          return;
        }
        const booking = await createBooking(token, request);
        router.push(`/bookings/${booking.id}/success`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not confirm booking");
      } finally {
        setIsLoading(false);
      }
    },
    [router],
  );

  return { isLoading, error, submit };
}
