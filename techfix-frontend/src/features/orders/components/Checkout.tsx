"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/features/cart/CartProvider";
import { useCheckout } from "@/features/orders/hooks/useCheckout";
import {
  PAYMENT_METHOD_LABELS,
  type PaymentMethod,
  type ShippingAddress,
} from "@/features/orders/types/order.types";

const EMPTY_ADDRESS: ShippingAddress = {
  fullName: "",
  phone: "",
  email: "",
  street: "",
  city: "Kathmandu",
  postalCode: "",
  landmark: "",
};

const PAYMENT_OPTIONS: PaymentMethod[] = [
  "esewa",
  "khalti",
  "cash_on_delivery",
  "bank_transfer",
];

/**
 * Checkout — feature UI only.
 *
 * Two steps rather than one long form (Hick's Law), with a persistent order
 * summary so the shopper never loses sight of what they're paying — the
 * same sidebar pattern the repair booking wizard uses.
 */
export default function Checkout() {
  const { items, totals, isReady } = useCart();
  const { placeOrder, isSubmitting, error, clearError } = useCheckout();

  const [step, setStep] = useState<1 | 2>(1);
  const [address, setAddress] = useState<ShippingAddress>(EMPTY_ADDRESS);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("esewa");
  const [validationError, setValidationError] = useState<string | null>(null);

  function set<K extends keyof ShippingAddress>(key: K, value: ShippingAddress[K]) {
    setAddress((prev) => ({ ...prev, [key]: value }));
  }

  function validateAddress(): string | null {
    if (!address.fullName.trim()) return "Full name is required";
    if (!address.phone.trim()) return "Phone number is required";
    if (!/^\S+@\S+\.\S+$/.test(address.email)) return "Enter a valid email address";
    if (!address.street.trim()) return "Street address is required";
    if (!address.city.trim()) return "City is required";
    return null;
  }

  function goToPayment(event: React.FormEvent) {
    event.preventDefault();
    const problem = validateAddress();
    setValidationError(problem);
    if (!problem) setStep(2);
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    clearError();
    await placeOrder(address, paymentMethod);
  }

  if (!isReady) {
    return (
      <section className="checkout">
        <p style={{ color: "var(--color-text-muted)" }}>Loading checkout…</p>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="checkout">
        <div className="dash__head">
          <h1 className="dash__title">Checkout</h1>
        </div>
        <p className="dash__empty">
          Your cart is empty —{" "}
          <Link href="/products" style={{ color: "var(--color-action-secondary)" }}>
            browse products
          </Link>{" "}
          first.
        </p>
      </section>
    );
  }

  const message = validationError ?? error;

  return (
    <section className="checkout" aria-labelledby="checkout-heading">
      <div className="dash__head">
        <h1 id="checkout-heading" className="dash__title">
          Checkout
        </h1>
        {/* Visible progress keeps an unfinished task salient (Zeigarnik Effect). */}
        <p className="dash__subtitle">Step {step} of 2 — {step === 1 ? "Delivery" : "Payment"}</p>
      </div>

      <div className="bdetail__grid">
        <div className="bdetail__panel">
          {message && (
            <div className="fp__error" role="alert">
              {message}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={goToPayment} noValidate>
              <h2 className="bdetail__panel-title">Delivery Address</h2>

              <div className="lform__grid">
                <label className="lform__field">
                  <span className="lform__label">Full name</span>
                  <input
                    className="lform__input"
                    value={address.fullName}
                    onChange={(e) => set("fullName", e.target.value)}
                  />
                </label>
                <label className="lform__field">
                  <span className="lform__label">Phone</span>
                  <input
                    className="lform__input"
                    value={address.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    placeholder="+977-98XXXXXXXX"
                  />
                </label>
                <label className="lform__field lform__field--wide">
                  <span className="lform__label">Email</span>
                  <input
                    className="lform__input"
                    type="email"
                    value={address.email}
                    onChange={(e) => set("email", e.target.value)}
                  />
                </label>
                <label className="lform__field lform__field--wide">
                  <span className="lform__label">Street address</span>
                  <input
                    className="lform__input"
                    value={address.street}
                    onChange={(e) => set("street", e.target.value)}
                  />
                </label>
                <label className="lform__field">
                  <span className="lform__label">City</span>
                  <input
                    className="lform__input"
                    value={address.city}
                    onChange={(e) => set("city", e.target.value)}
                  />
                </label>
                <label className="lform__field">
                  <span className="lform__label">Postal code</span>
                  <input
                    className="lform__input"
                    value={address.postalCode ?? ""}
                    onChange={(e) => set("postalCode", e.target.value)}
                  />
                </label>
                <label className="lform__field lform__field--wide">
                  <span className="lform__label">Landmark (optional)</span>
                  <input
                    className="lform__input"
                    value={address.landmark ?? ""}
                    onChange={(e) => set("landmark", e.target.value)}
                    placeholder="Near Durbar Marg"
                  />
                </label>
              </div>

              <div className="lform__actions">
                <button type="submit" className="lform__submit">
                  Continue to Payment
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={submit}>
              <h2 className="bdetail__panel-title">Payment Method</h2>

              <div className="checkout__payments">
                {PAYMENT_OPTIONS.map((method) => (
                  <label
                    className={`checkout__payment ${
                      paymentMethod === method ? "checkout__payment--active" : ""
                    }`}
                    key={method}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === method}
                      onChange={() => setPaymentMethod(method)}
                    />
                    <span>{PAYMENT_METHOD_LABELS[method]}</span>
                  </label>
                ))}
              </div>

              <p className="lform__hint">
                No payment is actually processed — this records your chosen method only.
              </p>

              <div className="lform__actions">
                <button type="submit" className="lform__submit" disabled={isSubmitting}>
                  {isSubmitting ? "Placing order…" : `Place Order — $${totals.total.toFixed(2)}`}
                </button>
                <button
                  type="button"
                  className="lform__cancel"
                  onClick={() => setStep(1)}
                  disabled={isSubmitting}
                >
                  Back
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Persistent summary — the shopper never loses sight of the total. */}
        <div className="bdetail__side">
          <div className="bdetail__panel">
            <h2 className="bdetail__panel-title">Order Summary</h2>
            <dl className="bdetail__rows">
              {items.map((item) => (
                <div className="bdetail__row" key={item.productId}>
                  <dt>
                    {item.title} × {item.quantity}
                  </dt>
                  <dd>${(item.price * item.quantity).toFixed(2)}</dd>
                </div>
              ))}
              <div className="bdetail__row">
                <dt>Shipping</dt>
                <dd>{totals.shipping === 0 ? "Free" : `$${totals.shipping.toFixed(2)}`}</dd>
              </div>
              <div className="bdetail__row bdetail__row--total">
                <dt>Total</dt>
                <dd>${totals.total.toFixed(2)}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
