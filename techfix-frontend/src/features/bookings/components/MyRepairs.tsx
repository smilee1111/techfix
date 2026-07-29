"use client";

import Link from "next/link";
import { useMyBookings } from "@/features/bookings/hooks/useMyBookings";
import { REPAIR_STAGES } from "@/features/bookings/types/booking.types";

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function stageBadgeClass(stage: string): string {
  if (stage === "delivered") return "dash__stage-badge dash__stage-badge--delivered";
  if (stage === "received") return "dash__stage-badge";
  return "dash__stage-badge dash__stage-badge--active";
}

function stageLabel(stage: string): string {
  return REPAIR_STAGES.find((s) => s.value === stage)?.label ?? stage;
}

/**
 * Customer's "My Repairs" list — feature UI only. This is the other half
 * of the tracking loop: whatever stage the seller sets shows up here,
 * matching the design guide's "repair status must always be visible and
 * current" requirement (Abhay's persona pain point).
 */
export default function MyRepairs() {
  const { items, isLoading, error } = useMyBookings();

  return (
    <section className="dash" aria-labelledby="my-repairs-heading">
      <div className="dash__head">
        <h1 id="my-repairs-heading" className="dash__title">
          My Repairs
        </h1>
        <p className="dash__subtitle">Track the status of every repair you&apos;ve booked.</p>
      </div>

      <div className="dash__list">
        {error && (
          <div className="fp__error" role="alert">
            {error}
          </div>
        )}
        {isLoading ? (
          <p style={{ color: "var(--color-text-muted)" }}>Loading your repairs…</p>
        ) : items.length === 0 ? (
          <p className="dash__empty">
            You haven&apos;t booked a repair yet — browse{" "}
            <Link href="/repairs" style={{ color: "var(--color-action-secondary)" }}>
              repair shops
            </Link>{" "}
            to get started.
          </p>
        ) : (
          items.map((booking) => (
            // Whole row is the link target, so the common action (open the
            // repair) is the largest possible hit area (Fitts's Law).
            <Link
              href={`/bookings/${booking.id}`}
              key={booking.id}
              className="dash__card dash__card--clickable"
            >
              <div className="dash__card-avatar" aria-hidden>
                {initials(booking.providerName)}
              </div>
              <div className="dash__card-info">
                <span className="dash__card-title">
                  {booking.providerName} — {booking.repairOptionName}
                </span>
                <span className="dash__card-meta">
                  {booking.referenceId} · {booking.repairServiceTitle}
                </span>
              </div>
              <span className="dash__card-price">${booking.total.toFixed(2)}</span>
              <span className={stageBadgeClass(booking.currentStage)}>
                {stageLabel(booking.currentStage)}
              </span>
            </Link>
          ))
        )}
      </div>
    </section>
  );
}
