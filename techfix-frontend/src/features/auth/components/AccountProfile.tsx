"use client";

import { useState, useEffect, type FormEvent } from "react";
import Link from "next/link";
import { useProfile } from "@/features/auth/hooks/useProfile";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useMyBookings } from "@/features/bookings/hooks/useMyBookings";

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function formatMemberSince(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

const ROLE_LABELS: Record<string, string> = {
  customer: "Customer",
  seller: "Seller",
  admin: "Admin",
};

/**
 * Account profile view — feature-specific UI living in
 * features/auth/components. Uses useProfile for data, useAuth for sign-out.
 */
export default function AccountProfile() {
  const { profile, isLoading, error, updateProfile, isSaving } = useProfile();
  const { logout } = useAuth();
  const { items: bookings, isLoading: bookingsLoading } = useMyBookings();

  const totalRepairs = bookings.length;
  const activeRepairs = bookings.filter((b) => b.currentStage !== "delivered").length;

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (profile) {
      setName(profile.fullName);
      setPhone(profile.phone);
    }
  }, [profile]);

  async function handleSave(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await updateProfile({ name, phone });
    setIsEditing(false);
  }

  if (isLoading) {
    return (
      <section className="account" aria-labelledby="account-heading">
        <p style={{ color: "var(--color-text-muted)" }}>Loading your profile…</p>
      </section>
    );
  }

  if (error || !profile) {
    return (
      <section className="account" aria-labelledby="account-heading">
        <div className="fp__error" role="alert">
          {error ?? "Could not load your profile."}
        </div>
      </section>
    );
  }

  return (
    <section className="account" aria-labelledby="account-heading">
      <h1 id="account-heading" className="sr-only" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden" }}>
        Account Profile
      </h1>

      {/* Hero */}
      <div className="account__hero">
        <div className="account__avatar" aria-hidden>
          {initials(profile.fullName)}
        </div>
        <div className="account__hero-info">
          <p className="account__name">{profile.fullName}</p>
          <p className="account__meta">
            {profile.email} · {ROLE_LABELS[profile.role] ?? profile.role} Account
          </p>
        </div>
        <button
          type="button"
          className="account__edit-btn"
          onClick={() => setIsEditing((v) => !v)}
        >
          {isEditing ? "Cancel" : "Edit Profile"}
        </button>
      </div>

      {/* Stats — derived from the customer's real bookings. The "Orders"
          tile is deliberately absent until the product side ships. */}
      <div className="account__stats">
        <div className="account__stat">
          <p className="account__stat-value">{bookingsLoading ? "—" : totalRepairs}</p>
          <p className="account__stat-label">Repairs</p>
        </div>
        <div className="account__stat">
          <p className="account__stat-value">{bookingsLoading ? "—" : activeRepairs}</p>
          <p className="account__stat-label">Active</p>
        </div>
        <div className="account__stat">
          <p className="account__stat-value">{formatMemberSince(profile.createdAt)}</p>
          <p className="account__stat-label">Member</p>
        </div>
      </div>

      <div className="account__body">
        {/* Sidebar */}
        <nav className="account__sidebar" aria-label="Account navigation">
          {profile.role === "seller" && (
            <>
              <Link href="/seller/dashboard" className="account__nav-item account__nav-item--active">
                Seller Dashboard <span aria-hidden>→</span>
              </Link>
              <div className="account__nav-divider" />
            </>
          )}
          {profile.role === "admin" && (
            <>
              <Link href="/admin" className="account__nav-item account__nav-item--active">
                Admin Panel <span aria-hidden>→</span>
              </Link>
              <div className="account__nav-divider" />
            </>
          )}
          <Link
            href="/my-repairs"
            className={`account__nav-item ${profile.role === "customer" ? "account__nav-item--active" : ""}`}
          >
            My Repairs <span aria-hidden>→</span>
          </Link>
          <div className="account__nav-divider" />
          <Link href="/orders" className="account__nav-item">
            Order History <span aria-hidden>→</span>
          </Link>
          <div className="account__nav-divider" />
          <span className="account__nav-item account__nav-item--muted">Saved Addresses</span>
          <div className="account__nav-divider" />
          <span className="account__nav-item account__nav-item--muted">Payment Methods</span>
          <div className="account__nav-divider" />
          <span className="account__nav-item account__nav-item--muted">Notifications</span>
          <div className="account__nav-divider" />
          <span className="account__nav-item account__nav-item--muted">Account Settings</span>
          <div className="account__nav-divider" />
          <button type="button" className="account__nav-item account__nav-item--signout" onClick={logout}>
            Sign Out
          </button>
        </nav>

        {/* Main content */}
        <div className="account__main">
          <div className="account__card">
            <p className="account__card-title">Personal Information</p>

            {isEditing ? (
              <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div className="account__row">
                  <label htmlFor="account-name" className="account__row-label">Full Name</label>
                  <input
                    id="account-name"
                    className="account__row-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="account__row">
                  <label htmlFor="account-phone" className="account__row-label">Phone</label>
                  <input
                    id="account-phone"
                    className="account__row-input"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div className="account__divider" />
                <button type="submit" className="account__save-btn" disabled={isSaving}>
                  {isSaving ? "Saving…" : "Save Changes"}
                </button>
              </form>
            ) : (
              <>
                <div className="account__row">
                  <span className="account__row-label">Full Name</span>
                  <span className="account__row-value">{profile.fullName}</span>
                </div>
                <div className="account__row">
                  <span className="account__row-label">Email</span>
                  <span className="account__row-value">{profile.email}</span>
                </div>
                <div className="account__row">
                  <span className="account__row-label">Phone</span>
                  <span className="account__row-value">{profile.phone}</span>
                </div>
                <div className="account__row">
                  <span className="account__row-label">Role</span>
                  <span className="account__row-value">
                    {ROLE_LABELS[profile.role] ?? profile.role}
                  </span>
                </div>
                <div className="account__divider" />
                <button type="button" className="account__save-btn" onClick={() => setIsEditing(true)}>
                  Edit Profile
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
