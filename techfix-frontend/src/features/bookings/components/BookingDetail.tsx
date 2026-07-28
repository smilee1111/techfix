"use client";

import Link from "next/link";
import Image from "next/image";
import { useBookingDetail } from "@/features/bookings/hooks/useBookingDetail";
import {
  REPAIR_STAGES,
  PAYMENT_METHOD_LABELS,
  type StatusLogEntry,
} from "@/features/bookings/types/booking.types";

type StepState = "done" | "current" | "upcoming";

interface TimelineStep {
  value: string;
  label: string;
  state: StepState;
  log?: StatusLogEntry;
  fallbackTimestamp?: string;
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * Projects the append-only status log onto the canonical five-stage ladder.
 *
 * The log only contains stages a seller has actually set, so the ladder is
 * what gives the customer the "what's left" half of the picture — every
 * stage is always shown, and each one is marked done / current / upcoming.
 * A freshly created booking has no log rows at all, so the first stage
 * falls back to the booking's own creation time.
 */
function buildTimeline(
  currentStage: string,
  logs: StatusLogEntry[],
  createdAt: string,
): TimelineStep[] {
  // The API returns newest-first; the timeline reads top-down chronologically.
  const chronological = [...logs].reverse();
  const currentIndex = REPAIR_STAGES.findIndex((s) => s.value === currentStage);

  return REPAIR_STAGES.map((stage, index) => {
    const state: StepState =
      index < currentIndex ? "done" : index === currentIndex ? "current" : "upcoming";

    return {
      value: stage.value,
      label: stage.label,
      state,
      log: chronological.find((entry) => entry.stage === stage.value),
      fallbackTimestamp: index === 0 ? createdAt : undefined,
    };
  });
}

interface BookingDetailProps {
  id: string;
}

/**
 * Booking detail + repair timeline — feature UI only.
 *
 * Closes the tracking loop the earlier sprint left open: the seller's stage
 * changes were already recorded in RepairStatusLog, but nothing rendered
 * that history. Shows the full stage ladder with timestamps and technician
 * notes, so the customer never has to ask "where is my device?"
 * (Visibility of System Status).
 */
export default function BookingDetail({ id }: BookingDetailProps) {
  const { booking, logs, isLoading, error } = useBookingDetail(id);

  if (isLoading) {
    return (
      <section className="bdetail">
        <p style={{ color: "var(--color-text-muted)" }}>Loading this repair…</p>
      </section>
    );
  }

  if (error || !booking) {
    return (
      <section className="bdetail">
        <div className="fp__error" role="alert">
          {error ?? "This repair could not be found."}
        </div>
        <Link href="/my-repairs" className="bdetail__back">
          ← Back to My Repairs
        </Link>
      </section>
    );
  }

  const steps = buildTimeline(booking.currentStage, logs, booking.createdAt);

  return (
    <section className="bdetail" aria-labelledby="bdetail-heading">
      <Link href="/my-repairs" className="bdetail__back">
        ← Back to My Repairs
      </Link>

      <div className="bdetail__head">
        <div>
          <h1 id="bdetail-heading" className="bdetail__title">
            {booking.repairOptionName}
          </h1>
          <p className="bdetail__subtitle">
            {booking.referenceId} · {booking.providerName} · {booking.repairServiceTitle}
          </p>
        </div>
        <span
          className={
            booking.currentStage === "delivered"
              ? "dash__stage-badge dash__stage-badge--delivered"
              : "dash__stage-badge dash__stage-badge--active"
          }
        >
          {REPAIR_STAGES.find((s) => s.value === booking.currentStage)?.label ??
            booking.currentStage}
        </span>
      </div>

      <div className="bdetail__grid">
        {/* ── Repair progress timeline ───────────────────────────────── */}
        <div className="bdetail__panel">
          <h2 className="bdetail__panel-title">Repair Progress</h2>

          <ol className="timeline">
            {steps.map((step) => (
              <li key={step.value} className={`timeline__item timeline__item--${step.state}`}>
                <div className="timeline__marker" aria-hidden>
                  {step.state === "done" ? "✓" : ""}
                </div>

                <div className="timeline__body">
                  <div className="timeline__row">
                    <span className="timeline__label">{step.label}</span>
                    {(step.log || step.fallbackTimestamp) && step.state !== "upcoming" && (
                      <time className="timeline__time">
                        {formatDateTime(step.log?.timestamp ?? step.fallbackTimestamp!)}
                      </time>
                    )}
                  </div>

                  {step.state === "upcoming" ? (
                    <span className="timeline__pending">Not started yet</span>
                  ) : (
                    <>
                      {step.log?.note && <p className="timeline__note">{step.log.note}</p>}
                      {step.log && (
                        <span className="timeline__author">
                          Updated by {step.log.updatedByName}
                        </span>
                      )}
                    </>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* ── Booking summary ────────────────────────────────────────── */}
        <div className="bdetail__side">
          <div className="bdetail__panel">
            <h2 className="bdetail__panel-title">Price Breakdown</h2>
            <dl className="bdetail__rows">
              <div className="bdetail__row">
                <dt>Service</dt>
                <dd>${booking.subtotal.toFixed(2)}</dd>
              </div>
              {booking.pickupDeliveryFee > 0 && (
                <div className="bdetail__row">
                  <dt>Pickup &amp; delivery</dt>
                  <dd>${booking.pickupDeliveryFee.toFixed(2)}</dd>
                </div>
              )}
              <div className="bdetail__row">
                <dt>Service fee</dt>
                <dd>${booking.serviceFee.toFixed(2)}</dd>
              </div>
              <div className="bdetail__row bdetail__row--total">
                <dt>Total</dt>
                <dd>${booking.total.toFixed(2)}</dd>
              </div>
            </dl>
          </div>

          <div className="bdetail__panel">
            <h2 className="bdetail__panel-title">Booking Details</h2>
            <dl className="bdetail__rows">
              <div className="bdetail__row">
                <dt>Booked on</dt>
                <dd>{formatDateTime(booking.createdAt)}</dd>
              </div>
              <div className="bdetail__row">
                <dt>Estimated pickup</dt>
                <dd>{formatDateTime(booking.estimatedPickupDate)}</dd>
              </div>
              <div className="bdetail__row">
                <dt>Method</dt>
                <dd>{booking.bookingType === "pickup" ? "Pickup" : "Drop-off"}</dd>
              </div>
              {booking.pickupAddress && (
                <div className="bdetail__row">
                  <dt>Address</dt>
                  <dd>{booking.pickupAddress}</dd>
                </div>
              )}
              <div className="bdetail__row">
                <dt>Payment</dt>
                <dd>{PAYMENT_METHOD_LABELS[booking.paymentMethod] ?? booking.paymentMethod}</dd>
              </div>
              <div className="bdetail__row">
                <dt>Contact</dt>
                <dd>
                  {booking.contactName}
                  <br />
                  {booking.contactPhone}
                </dd>
              </div>
            </dl>
          </div>

          {(booking.issueDescription || booking.issuePhotos.length > 0) && (
            <div className="bdetail__panel">
              <h2 className="bdetail__panel-title">Reported Issue</h2>
              {booking.issueDescription && (
                <p className="bdetail__issue">{booking.issueDescription}</p>
              )}
              {booking.issuePhotos.length > 0 && (
                <div className="bdetail__photos">
                  {booking.issuePhotos.map((url, index) => (
                    <a
                      key={url}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bdetail__photo"
                    >
                      <Image
                        src={url}
                        alt={`Reported issue photo ${index + 1}`}
                        width={96}
                        height={96}
                        unoptimized
                      />
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
