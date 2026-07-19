"use client";

import Link from "next/link";
import { useBookingResult } from "@/features/bookings/hooks/useBookingResult";

function formatPickupDate(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

interface BookingSuccessProps {
  id: string;
}

/**
 * Booking success page content — feature UI only.
 * Distinct success screen per the design guide: checkmark, bold
 * confirmation, reference ID, and two clear next-step buttons (Peak-End Rule).
 */
export default function BookingSuccess({ id }: BookingSuccessProps) {
  const { booking, isLoading, error } = useBookingResult(id);

  if (isLoading) {
    return (
      <section className="booking-success">
        <p style={{ color: "var(--color-text-muted)" }}>Loading your booking…</p>
      </section>
    );
  }

  if (error || !booking) {
    return (
      <section className="booking-success">
        <div className="fp__error" role="alert">
          {error ?? "This booking could not be found."}
        </div>
      </section>
    );
  }

  return (
    <section className="booking-success" aria-labelledby="booking-success-heading">
      <div className="booking-success__stack">
        <div className="booking-success__icon" aria-hidden>
          ✓
        </div>

        <div className="booking-success__head">
          <h1 id="booking-success-heading" className="booking-success__title">
            Booking Confirmed!
          </h1>
          <p className="booking-success__subtitle">
            Your repair has been scheduled. We&apos;ve sent a confirmation email with all the
            details.
          </p>
        </div>

        <div className="booking-success__card">
          <div className="booking-success__top-row">
            <div className="booking-success__block">
              <span className="booking-success__block-label">BOOKING ID</span>
              <span className="booking-success__block-value">{booking.referenceId}</span>
            </div>
            <div className="booking-success__block">
              <span className="booking-success__block-label">ESTIMATED PICKUP</span>
              <span className="booking-success__block-value">
                {formatPickupDate(booking.estimatedPickupDate)}
              </span>
            </div>
          </div>
          <div className="booking-success__divider" />
          <div>
            <p className="booking-success__provider-label">SERVICE PROVIDER</p>
            <p className="booking-success__provider-value">
              {booking.providerName} — {booking.repairOptionName}
            </p>
          </div>
        </div>

        <div className="booking-success__actions">
          {/* Repair tracking (Track Progress) isn't built until a later sprint —
              point at the account page for now rather than a dead link. */}
          <Link href="/account" className="booking-success__btn-primary">
            Track My Repair
          </Link>
          <Link href="/dashboard" className="booking-success__btn-secondary">
            Back to Home
          </Link>
        </div>
      </div>
    </section>
  );
}
