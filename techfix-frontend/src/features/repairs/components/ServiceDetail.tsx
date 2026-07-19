"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRepairDetail } from "@/features/repairs/hooks/useRepairDetail";
import { getValidAccessToken } from "@/lib/session";
import { uploadRepairPhotos } from "@/features/uploads/api/uploadApi";
import { savePendingIssue } from "@/features/bookings/pendingIssue";

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

const PICKUP_FEE = 12;

interface ServiceDetailProps {
  id: string;
}

/**
 * Repair service detail page content — feature UI only.
 * Lets the user pick a repair option, attach issue photos/description,
 * and review the full price breakdown before booking.
 */
export default function ServiceDetail({ id }: ServiceDetailProps) {
  const router = useRouter();
  const { repair, isLoading, error } = useRepairDetail(id);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(0);
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  if (isLoading) {
    return (
      <section className="service-detail">
        <p style={{ color: "var(--color-text-muted)" }}>Loading service details…</p>
      </section>
    );
  }

  if (error || !repair) {
    return (
      <section className="service-detail">
        <div className="fp__error" role="alert">
          {error ?? "This repair service could not be found."}
        </div>
      </section>
    );
  }

  const selectedOption = repair.repairOptions[selectedOptionIndex];
  const serviceCost = selectedOption?.price ?? repair.priceRange.min;
  const total = serviceCost + PICKUP_FEE;

  async function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    const token = await getValidAccessToken();
    if (!token) {
      window.location.href = `/login?next=/repairs/${id}`;
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    try {
      const urls = await uploadRepairPhotos(token, files);
      setPhotos((prev) => [...prev, ...urls]);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Could not upload photos");
    } finally {
      setIsUploading(false);
    }
  }

  async function handleBookNow() {
    const token = await getValidAccessToken();
    if (!token) {
      window.location.href = `/login?next=/repairs/${id}`;
      return;
    }
    const option = repair!.repairOptions[selectedOptionIndex];
    savePendingIssue(id, { description, photoUrls: photos });
    router.push(
      `/repairs/${id}/book?option=${encodeURIComponent(option.name)}&price=${option.price}`,
    );
  }

  return (
    <section className="service-detail" aria-labelledby="service-detail-heading">
      <nav className="service-detail__breadcrumbs" aria-label="Breadcrumb">
        <Link href="/repairs">Repairs</Link>
        <span>›</span>
        <Link href="/repairs">Search Results</Link>
        <span>›</span>
        <strong>{repair.provider.name}</strong>
      </nav>

      <div className="service-detail__body">
        <div className="service-detail__left">
          {/* Provider header */}
          <div className="service-detail__provider-header">
            <div className="service-detail__provider-avatar" aria-hidden>
              {initials(repair.provider.name)}
            </div>
            <div className="service-detail__provider-info">
              <div className="service-detail__name-row">
                <h1 id="service-detail-heading" className="service-detail__name">
                  {repair.provider.name}
                </h1>
                {repair.isVerified && (
                  <span className="service-detail__verified-badge">✓ Verified</span>
                )}
              </div>
              <div className="service-detail__rating-row">
                <span className="service-detail__stars">
                  {"★".repeat(Math.round(repair.averageRating))}
                </span>
                <span className="service-detail__rating-text">
                  {repair.averageRating.toFixed(1)} ({repair.totalReviews} reviews) ·{" "}
                  {repair.location.address}
                </span>
              </div>
              <p className="service-detail__description">{repair.description}</p>
            </div>
          </div>

          {/* Repair options */}
          <div>
            <p className="service-detail__section-title" style={{ marginBottom: 20 }}>
              Select Repair Service
            </p>
            <div className="service-detail__options">
              {repair.repairOptions.map((option, index) => (
                <button
                  type="button"
                  key={option.name}
                  className={`service-detail__option ${
                    index === selectedOptionIndex ? "service-detail__option--selected" : ""
                  }`}
                  onClick={() => setSelectedOptionIndex(index)}
                >
                  <span
                    className={`service-detail__option-radio ${
                      index === selectedOptionIndex ? "service-detail__option-radio--checked" : ""
                    }`}
                    aria-hidden
                  />
                  <span className="service-detail__option-text">
                    <span className="service-detail__option-name">{option.name}</span>
                    {option.description && (
                      <span className="service-detail__option-desc">{option.description}</span>
                    )}
                  </span>
                  <span className="service-detail__option-price-col">
                    <span className="service-detail__option-price">${option.price.toFixed(2)}</span>
                    {option.estimatedTime && (
                      <span className="service-detail__option-time">{option.estimatedTime}</span>
                    )}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Issue documentation */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <p className="service-detail__section-title">Issue Documentation</p>

            <label className="service-detail__upload-box">
              <span className="service-detail__upload-icon" aria-hidden />
              <span className="service-detail__upload-text">
                {isUploading ? "Uploading…" : "Drag and drop photos here, or click to browse"}
              </span>
              <span className="service-detail__upload-hint">PNG, JPG up to 10MB each</span>
              <input
                type="file"
                accept="image/png,image/jpeg"
                multiple
                disabled={isUploading}
                onChange={handlePhotoSelect}
                style={{ display: "none" }}
              />
            </label>

            {uploadError && (
              <div className="fp__error" role="alert">
                {uploadError}
              </div>
            )}

            {photos.length > 0 && (
              // eslint-disable-next-line @next/next/no-img-element
              <div className="service-detail__thumbs">
                {photos.map((src, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={i} src={src} alt="" className="service-detail__thumb" />
                ))}
              </div>
            )}

            <div>
              <p className="fp__label" style={{ marginBottom: 8 }}>
                DETAILED DESCRIPTION
              </p>
              <textarea
                className="service-detail__textarea"
                placeholder="e.g. Phone dropped on concrete, green lines appearing on left side of screen..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Booking summary sidebar */}
        <aside className="service-detail__sidebar" aria-label="Booking summary">
          <p className="service-detail__sidebar-title">Booking Summary</p>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div className="service-detail__info-row">
              <span className="service-detail__info-label">Service:</span>
              <span className="service-detail__info-value">{selectedOption?.name}</span>
            </div>
            <div className="service-detail__info-row">
              <span className="service-detail__info-label">Estimated Time:</span>
              <span className="service-detail__info-value">
                {selectedOption?.estimatedTime ?? repair.estimatedTime ?? "—"}
              </span>
            </div>
          </div>

          <div className="service-detail__price-box">
            <div className="service-detail__price-row">
              <span>Service Cost</span>
              <span>${serviceCost.toFixed(2)}</span>
            </div>
            <div className="service-detail__price-row">
              <span>Pickup Fee</span>
              <span>${PICKUP_FEE.toFixed(2)}</span>
            </div>
            <div className="service-detail__price-row service-detail__price-row--total">
              <span>Total</span>
              <span className="service-detail__total-value">${total.toFixed(2)}</span>
            </div>
          </div>

          <div className="service-detail__btn-stack">
            <button type="button" className="service-detail__btn-primary" onClick={handleBookNow}>
              Book Now
            </button>
            <button type="button" className="service-detail__btn-secondary">
              Save Quote
            </button>
          </div>

          <div className="service-detail__disclaimer">
            <span className="service-detail__disclaimer-dot" aria-hidden />
            <p className="service-detail__disclaimer-text">
              All repairs include a {repair.warranty ?? "90-day"} warranty. Free cancellation up to
              1 hour before pickup.
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}
