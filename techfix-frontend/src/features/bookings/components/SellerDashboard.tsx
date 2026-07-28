"use client";

import { useState } from "react";
import Link from "next/link";
import { useIncomingBookings } from "@/features/bookings/hooks/useIncomingBookings";
import { useMyListings } from "@/features/repairs/hooks/useMyListings";
import { REPAIR_STAGES, type RepairStage } from "@/features/bookings/types/booking.types";

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
 * Seller dashboard — feature UI only. Two tabs: the seller's own repair
 * listings (read-only for now — creating/editing a listing is a natural
 * next increment on top of the existing POST /api/repairs endpoint), and
 * their incoming bookings queue, where they advance each booking's repair
 * stage — the other half of the "seller updates status, customer sees it"
 * loop.
 */
export default function SellerDashboard() {
  const [tab, setTab] = useState<"bookings" | "listings">("bookings");
  const { items: listings, isLoading: listingsLoading, error: listingsError } = useMyListings();
  const {
    items: bookings,
    isLoading: bookingsLoading,
    error: bookingsError,
    updatingId,
    advanceStage,
  } = useIncomingBookings();

  return (
    <section className="dash" aria-labelledby="seller-dash-heading">
      <div className="dash__head">
        <h1 id="seller-dash-heading" className="dash__title">
          Seller Dashboard
        </h1>
        <p className="dash__subtitle">Manage your repair listings and incoming bookings.</p>
      </div>

      <div className="dash__tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "bookings"}
          className={`dash__tab ${tab === "bookings" ? "dash__tab--active" : ""}`}
          onClick={() => setTab("bookings")}
        >
          Incoming Bookings
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "listings"}
          className={`dash__tab ${tab === "listings" ? "dash__tab--active" : ""}`}
          onClick={() => setTab("listings")}
        >
          My Listings
        </button>
      </div>

      {tab === "bookings" ? (
        <div className="dash__list">
          {bookingsError && (
            <div className="fp__error" role="alert">
              {bookingsError}
            </div>
          )}
          {bookingsLoading ? (
            <p style={{ color: "var(--color-text-muted)" }}>Loading incoming bookings…</p>
          ) : bookings.length === 0 ? (
            <p className="dash__empty">No bookings yet — they&apos;ll show up here once a customer books one of your listings.</p>
          ) : (
            bookings.map((booking) => (
              <div className="dash__card" key={booking.id}>
                <div className="dash__card-avatar" aria-hidden>
                  {initials(booking.customerName)}
                </div>
                <div className="dash__card-info">
                  <span className="dash__card-title">
                    {booking.customerName} — {booking.repairOptionName}
                  </span>
                  <span className="dash__card-meta">
                    {booking.referenceId} · {booking.repairServiceTitle} · {booking.customerPhone}
                  </span>
                </div>
                <span className="dash__card-price">${booking.total.toFixed(2)}</span>
                <span className={stageBadgeClass(booking.currentStage)}>
                  {stageLabel(booking.currentStage)}
                </span>
                <select
                  className="dash__stage-select"
                  value={booking.currentStage}
                  disabled={updatingId === booking.id}
                  onChange={(e) => advanceStage(booking.id, e.target.value as RepairStage)}
                  aria-label={`Update repair stage for ${booking.referenceId}`}
                >
                  {REPAIR_STAGES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
                {/* A discrete link rather than a clickable row: this card
                    already owns a <select>, and an interactive control
                    can't live inside a link. */}
                <Link
                  href={`/bookings/${booking.id}`}
                  className="dash__card-view"
                  aria-label={`View full details for ${booking.referenceId}`}
                >
                  View
                </Link>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="dash__list">
          {listingsError && (
            <div className="fp__error" role="alert">
              {listingsError}
            </div>
          )}
          {listingsLoading ? (
            <p style={{ color: "var(--color-text-muted)" }}>Loading your listings…</p>
          ) : listings.length === 0 ? (
            <p className="dash__empty">You haven&apos;t listed any repair services yet.</p>
          ) : (
            listings.map((listing) => (
              <div className="dash__card" key={listing.id}>
                <div className="dash__card-avatar" aria-hidden>
                  {initials(listing.deviceType)}
                </div>
                <div className="dash__card-info">
                  <span className="dash__card-title">{listing.title}</span>
                  <span className="dash__card-meta">
                    {listing.deviceType} · ★ {listing.averageRating.toFixed(1)} ({listing.totalReviews})
                  </span>
                </div>
                <span className="dash__card-price">
                  ${listing.priceRange.min}
                  {listing.priceRange.max !== listing.priceRange.min ? `–$${listing.priceRange.max}` : ""}
                </span>
                <span className={listing.isVerified ? "dash__stage-badge dash__stage-badge--delivered" : "dash__stage-badge"}>
                  {listing.isVerified ? "Verified" : "Unverified"}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </section>
  );
}
