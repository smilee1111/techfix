"use client";

import Link from "next/link";
import { useOrderDetail } from "@/features/orders/hooks/useOrderDetail";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

interface OrderSuccessProps {
  id: string;
}

/**
 * Order confirmation — feature UI only.
 *
 * Deliberately mirrors the booking success screen: a positive, low-friction
 * final moment disproportionately shapes how the whole purchase is
 * remembered (Peak-End Rule).
 */
export default function OrderSuccess({ id }: OrderSuccessProps) {
  const { order, isLoading, error } = useOrderDetail(id);

  if (isLoading) {
    return (
      <section className="booking-success">
        <p style={{ color: "var(--color-text-muted)" }}>Loading your order…</p>
      </section>
    );
  }

  if (error || !order) {
    return (
      <section className="booking-success">
        <div className="fp__error" role="alert">
          {error ?? "This order could not be found."}
        </div>
      </section>
    );
  }

  return (
    <section className="booking-success" aria-labelledby="order-success-heading">
      <div className="booking-success__stack">
        <div className="booking-success__icon" aria-hidden>
          ✓
        </div>

        <div className="booking-success__head">
          <h1 id="order-success-heading" className="booking-success__title">
            Order Confirmed!
          </h1>
          <p className="booking-success__subtitle">
            Thanks — we&apos;ve sent a confirmation to {order.shippingAddress.email}.
          </p>
        </div>

        <div className="booking-success__card">
          <div className="booking-success__top-row">
            <div className="booking-success__block">
              <span className="booking-success__block-label">ORDER ID</span>
              <span className="booking-success__block-value">{order.referenceId}</span>
            </div>
            <div className="booking-success__block">
              <span className="booking-success__block-label">ESTIMATED DELIVERY</span>
              <span className="booking-success__block-value">
                {formatDate(order.estimatedDeliveryDate)}
              </span>
            </div>
          </div>
          <div className="booking-success__divider" />
          <div>
            <p className="booking-success__provider-label">DELIVERING TO</p>
            <p className="booking-success__provider-value">
              {order.shippingAddress.fullName} — {order.shippingAddress.street},{" "}
              {order.shippingAddress.city}
            </p>
          </div>
        </div>

        <div className="booking-success__actions">
          <Link href={`/orders/${order.id}`} className="booking-success__btn-primary">
            Track My Order
          </Link>
          <Link href="/products" className="booking-success__btn-secondary">
            Continue Shopping
          </Link>
        </div>
      </div>
    </section>
  );
}
