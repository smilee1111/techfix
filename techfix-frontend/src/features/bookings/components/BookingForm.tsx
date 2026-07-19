"use client";

import { useState } from "react";
import { useBooking } from "@/features/bookings/hooks/useBooking";
import { readPendingIssue, clearPendingIssue } from "@/features/bookings/pendingIssue";
import type { BookingType, BookingPaymentMethod } from "@/features/bookings/types/booking.types";

const PICKUP_DELIVERY_FEE = 12;
const SERVICE_FEE = 5;

const PAYMENT_OPTIONS: { value: BookingPaymentMethod; name: string; desc: string }[] = [
  { value: "card", name: "Credit / Debit Card", desc: "Visa, Mastercard, Amex" },
  { value: "digital_wallet", name: "Digital Wallet", desc: "eSewa, Khalti" },
  { value: "pay_at_pickup", name: "Pay at Pickup", desc: "Cash or card on collection" },
];

const STEPS = ["Logistics", "Contact", "Payment"] as const;

interface BookingFormProps {
  repairServiceId: string;
  repairOptionName: string;
  price: number;
}

/**
 * 3-step booking form (Logistics → Contact → Payment) — feature UI only.
 * Progress bar shows step status (Zeigarnik Effect); order summary sidebar
 * keeps price + fees visible throughout (no surprises at checkout).
 */
export default function BookingForm({ repairServiceId, repairOptionName, price }: BookingFormProps) {
  const { isLoading, error, submit } = useBooking();
  const [step, setStep] = useState(0);

  const [bookingType, setBookingType] = useState<BookingType>("pickup");
  const [pickupAddress, setPickupAddress] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<BookingPaymentMethod>("card");

  const pickupDeliveryFee = bookingType === "pickup" ? PICKUP_DELIVERY_FEE : 0;
  const total = price + pickupDeliveryFee + SERVICE_FEE;

  function next() {
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }
  function back() {
    setStep((s) => Math.max(s - 1, 0));
  }

  const step1Valid = bookingType === "dropoff" || pickupAddress.trim().length > 0;
  const step2Valid = contactName.trim() && contactPhone.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail);

  async function handleConfirm() {
    const pendingIssue = readPendingIssue(repairServiceId);
    clearPendingIssue(repairServiceId);

    await submit({
      repairService: repairServiceId,
      repairOptionName,
      bookingType,
      pickupAddress: bookingType === "pickup" ? pickupAddress : undefined,
      contactName,
      contactPhone,
      contactEmail,
      issueDescription: pendingIssue?.description,
      issuePhotos: pendingIssue?.photoUrls,
      paymentMethod,
    });
  }

  return (
    <section className="booking-form" aria-labelledby="booking-form-heading">
      <div className="booking-form__head">
        <h1 id="booking-form-heading" className="booking-form__title">
          Booking Form
        </h1>
        <p className="booking-form__subtitle">Configure your repair service and schedule a pickup.</p>
      </div>

      <div className="booking-form__progress">
        {STEPS.map((label, i) => (
          <div key={label} className="booking-form__progress-step">
            <div
              className={`booking-form__progress-bar ${
                i < step
                  ? "booking-form__progress-bar--done"
                  : i === step
                    ? "booking-form__progress-bar--active"
                    : ""
              }`}
            />
            <div className="booking-form__progress-row">
              <span className={i === step ? "booking-form__progress-name" : "booking-form__progress-name booking-form__progress-name--muted"}>
                {i + 1}. {label}
              </span>
              <span className="booking-form__progress-status">
                {i < step ? "Done" : i === step ? "Active" : "Pending"}
              </span>
            </div>
          </div>
        ))}
      </div>

      {error && (
        <div className="fp__error" role="alert">
          {error}
        </div>
      )}

      <div className="booking-form__body">
        <div className="booking-form__canvas">
          {step === 0 && (
            <div className="booking-form__section">
              <p className="booking-form__section-title">Step 1 Logistics</p>
              <div className="booking-form__toggle-row">
                <button
                  type="button"
                  className={`booking-form__toggle-btn ${bookingType === "pickup" ? "booking-form__toggle-btn--active" : ""}`}
                  onClick={() => setBookingType("pickup")}
                >
                  Pickup from my address
                </button>
                <button
                  type="button"
                  className={`booking-form__toggle-btn ${bookingType === "dropoff" ? "booking-form__toggle-btn--active" : ""}`}
                  onClick={() => setBookingType("dropoff")}
                >
                  Drop off at store
                </button>
              </div>
              {bookingType === "pickup" && (
                <div className="booking-form__field">
                  <label className="booking-form__field-label" htmlFor="pickup-address">
                    PICKUP ADDRESS
                  </label>
                  <textarea
                    id="pickup-address"
                    className="booking-form__input booking-form__textarea"
                    placeholder="Enter your full street address, apartment, and city..."
                    value={pickupAddress}
                    onChange={(e) => setPickupAddress(e.target.value)}
                  />
                </div>
              )}
              <button type="button" className="estimate-form__btn-primary" disabled={!step1Valid} onClick={next}>
                Continue →
              </button>
            </div>
          )}

          {step === 1 && (
            <div className="booking-form__section">
              <p className="booking-form__section-title">Step 2 Contact</p>
              <div className="booking-form__field">
                <label className="booking-form__field-label" htmlFor="contact-name">FULL NAME</label>
                <input
                  id="contact-name"
                  className="booking-form__input"
                  placeholder="John Doe"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                />
              </div>
              <div className="booking-form__field-row">
                <div className="booking-form__field">
                  <label className="booking-form__field-label" htmlFor="contact-phone">PHONE NUMBER</label>
                  <input
                    id="contact-phone"
                    className="booking-form__input"
                    placeholder="+977-98XXXXXXXX"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                  />
                </div>
                <div className="booking-form__field">
                  <label className="booking-form__field-label" htmlFor="contact-email">EMAIL ADDRESS</label>
                  <input
                    id="contact-email"
                    type="email"
                    className="booking-form__input"
                    placeholder="john@example.com"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                  />
                </div>
              </div>
              <div className="estimate-form__btn-row">
                <button type="button" className="estimate-form__btn-secondary" onClick={back}>← Back</button>
                <button type="button" className="estimate-form__btn-primary" disabled={!step2Valid} onClick={next}>
                  Continue →
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="booking-form__section">
              <p className="booking-form__section-title">Step 3 Payment</p>
              {PAYMENT_OPTIONS.map((opt) => (
                <button
                  type="button"
                  key={opt.value}
                  className={`booking-form__payment-option ${paymentMethod === opt.value ? "booking-form__payment-option--selected" : ""}`}
                  onClick={() => setPaymentMethod(opt.value)}
                  style={{ width: "100%", textAlign: "left", font: "inherit" }}
                >
                  <span
                    className={`booking-form__payment-radio ${paymentMethod === opt.value ? "booking-form__payment-radio--checked" : ""}`}
                    aria-hidden
                  />
                  <span style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <span className="booking-form__payment-name">{opt.name}</span>
                    <span className="booking-form__payment-desc">{opt.desc}</span>
                  </span>
                </button>
              ))}
              <div className="estimate-form__btn-row">
                <button type="button" className="estimate-form__btn-secondary" onClick={back}>← Back</button>
              </div>
            </div>
          )}
        </div>

        <div className="booking-form__sidebar-stack">
          <div className="booking-form__summary">
            <p className="booking-form__summary-title">ORDER SUMMARY</p>
            <div className="booking-form__line-items">
              <div className="booking-form__line">
                <span className="booking-form__line-label">{repairOptionName}</span>
                <span className="booking-form__line-value">${price.toFixed(2)}</span>
              </div>
              <div className="booking-form__line">
                <span className="booking-form__line-label">Pickup &amp; Delivery</span>
                <span className="booking-form__line-value">${pickupDeliveryFee.toFixed(2)}</span>
              </div>
              <div className="booking-form__line">
                <span className="booking-form__line-label">Service Fee</span>
                <span className="booking-form__line-value">${SERVICE_FEE.toFixed(2)}</span>
              </div>
            </div>
            <div className="fp__divider" />
            <div className="booking-form__total-row">
              <span style={{ color: "var(--color-text-primary)" }}>Total</span>
              <span className="booking-form__total-value">${total.toFixed(2)}</span>
            </div>
            <button
              type="button"
              className="booking-form__confirm-btn"
              disabled={step !== 2 || isLoading}
              onClick={handleConfirm}
            >
              {isLoading ? "Confirming…" : "Confirm Booking"}
            </button>
            <div className="booking-form__secure-note">
              <span className="booking-form__secure-dot" aria-hidden />
              Secure checkout, encrypted payment
            </div>
          </div>

          <div className="booking-form__trust-badge">
            <div className="booking-form__trust-icon" aria-hidden />
            <div>
              <p className="booking-form__trust-title">Certified Technicians</p>
              <p className="booking-form__trust-desc">All repairs backed by our 90-day warranty.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
