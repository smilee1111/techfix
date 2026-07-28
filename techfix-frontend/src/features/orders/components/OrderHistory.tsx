"use client";

import Link from "next/link";
import { useMyOrders } from "@/features/orders/hooks/useMyOrders";
import { ORDER_STAGES } from "@/features/orders/types/order.types";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function statusBadgeClass(status: string): string {
  if (status === "delivered") return "dash__stage-badge dash__stage-badge--delivered";
  if (status === "placed" || status === "cancelled") return "dash__stage-badge";
  return "dash__stage-badge dash__stage-badge--active";
}

function statusLabel(status: string): string {
  if (status === "cancelled") return "Cancelled";
  return ORDER_STAGES.find((s) => s.value === status)?.label ?? status;
}

/**
 * Order history — feature UI only.
 *
 * Mirrors "My Repairs": whole-row links into the tracker, one status badge
 * per row, so both halves of the marketplace read the same way.
 */
export default function OrderHistory() {
  const { items, isLoading, error } = useMyOrders();

  return (
    <section className="dash" aria-labelledby="orders-heading">
      <div className="dash__head">
        <h1 id="orders-heading" className="dash__title">
          Order History
        </h1>
        <p className="dash__subtitle">Track every product order you&apos;ve placed.</p>
      </div>

      <div className="dash__list">
        {error && (
          <div className="fp__error" role="alert">
            {error}
          </div>
        )}

        {isLoading ? (
          <p style={{ color: "var(--color-text-muted)" }}>Loading your orders…</p>
        ) : items.length === 0 ? (
          <p className="dash__empty">
            You haven&apos;t placed an order yet — browse{" "}
            <Link href="/products" style={{ color: "var(--color-action-secondary)" }}>
              tech products
            </Link>{" "}
            to get started.
          </p>
        ) : (
          items.map((order) => (
            <Link
              href={`/orders/${order.id}`}
              key={order.id}
              className="dash__card dash__card--clickable"
            >
              <div className="dash__card-avatar" aria-hidden>
                {order.items.length}
              </div>
              <div className="dash__card-info">
                <span className="dash__card-title">
                  {order.items[0]?.title}
                  {order.items.length > 1 ? ` + ${order.items.length - 1} more` : ""}
                </span>
                <span className="dash__card-meta">
                  {order.referenceId} · {formatDate(order.createdAt)}
                </span>
              </div>
              <span className="dash__card-price">${order.total.toFixed(2)}</span>
              <span className={statusBadgeClass(order.status)}>
                {statusLabel(order.status)}
              </span>
            </Link>
          ))
        )}
      </div>
    </section>
  );
}
