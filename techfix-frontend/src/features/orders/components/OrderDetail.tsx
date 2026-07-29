"use client";

import Link from "next/link";
import Image from "next/image";
import { useOrderDetail } from "@/features/orders/hooks/useOrderDetail";
import {
  ORDER_STAGES,
  PAYMENT_METHOD_LABELS,
  type OrderStatusLogEntry,
} from "@/features/orders/types/order.types";

type StepState = "done" | "current" | "upcoming";

interface TimelineStep {
  value: string;
  label: string;
  state: StepState;
  log?: OrderStatusLogEntry;
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
 * Projects the append-only order log onto the fulfilment ladder.
 *
 * Identical in shape to the repair timeline's buildTimeline — the log only
 * holds stages that actually happened, so the ladder supplies the "what's
 * left" half that a raw log cannot.
 */
function buildTimeline(
  status: string,
  logs: OrderStatusLogEntry[],
  createdAt: string,
): TimelineStep[] {
  const chronological = [...logs].reverse();
  const currentIndex = ORDER_STAGES.findIndex((s) => s.value === status);

  return ORDER_STAGES.map((stage, index) => {
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

interface OrderDetailProps {
  id: string;
}

/**
 * Order detail + delivery tracking — feature UI only.
 *
 * Reuses the repair timeline's markup and styles rather than inventing a
 * second tracker: both answer the same question ("where is my thing?"), and
 * a shopper who has tracked a repair should recognise this instantly.
 */
export default function OrderDetail({ id }: OrderDetailProps) {
  const { order, logs, isLoading, error } = useOrderDetail(id);

  if (isLoading) {
    return (
      <section className="bdetail">
        <p style={{ color: "var(--color-text-muted)" }}>Loading your order…</p>
      </section>
    );
  }

  if (error || !order) {
    return (
      <section className="bdetail">
        <div className="fp__error" role="alert">
          {error ?? "This order could not be found."}
        </div>
        <Link href="/orders" className="bdetail__back">
          ← Back to Orders
        </Link>
      </section>
    );
  }

  const cancelled = order.status === "cancelled";
  const steps = buildTimeline(order.status, logs, order.createdAt);

  return (
    <section className="bdetail" aria-labelledby="odetail-heading">
      <Link href="/orders" className="bdetail__back">
        ← Back to Orders
      </Link>

      <div className="bdetail__head">
        <div>
          <h1 id="odetail-heading" className="bdetail__title">
            {order.referenceId}
          </h1>
          <p className="bdetail__subtitle">
            Placed {formatDateTime(order.createdAt)} · {order.items.length}{" "}
            {order.items.length === 1 ? "item" : "items"}
          </p>
        </div>
        <span
          className={
            order.status === "delivered"
              ? "dash__stage-badge dash__stage-badge--delivered"
              : "dash__stage-badge dash__stage-badge--active"
          }
        >
          {cancelled
            ? "Cancelled"
            : (ORDER_STAGES.find((s) => s.value === order.status)?.label ?? order.status)}
        </span>
      </div>

      <div className="bdetail__grid">
        {/* ── Delivery tracking ──────────────────────────────────── */}
        <div className="bdetail__panel">
          <h2 className="bdetail__panel-title">Delivery Progress</h2>

          {cancelled ? (
            <p className="dash__empty">This order was cancelled.</p>
          ) : (
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
          )}
        </div>

        {/* ── Summary ────────────────────────────────────────────── */}
        <div className="bdetail__side">
          <div className="bdetail__panel">
            <h2 className="bdetail__panel-title">Order Summary</h2>
            <dl className="bdetail__rows">
              <div className="bdetail__row">
                <dt>Subtotal</dt>
                <dd>${order.subtotal.toFixed(2)}</dd>
              </div>
              <div className="bdetail__row">
                <dt>Shipping</dt>
                <dd>{order.shippingFee === 0 ? "Free" : `$${order.shippingFee.toFixed(2)}`}</dd>
              </div>
              <div className="bdetail__row bdetail__row--total">
                <dt>Total</dt>
                <dd>${order.total.toFixed(2)}</dd>
              </div>
            </dl>
          </div>

          <div className="bdetail__panel">
            <h2 className="bdetail__panel-title">Delivery Details</h2>
            <dl className="bdetail__rows">
              <div className="bdetail__row">
                <dt>Estimated</dt>
                <dd>{formatDateTime(order.estimatedDeliveryDate)}</dd>
              </div>
              <div className="bdetail__row">
                <dt>Payment</dt>
                <dd>{PAYMENT_METHOD_LABELS[order.paymentMethod] ?? order.paymentMethod}</dd>
              </div>
              <div className="bdetail__row">
                <dt>Ship to</dt>
                <dd>
                  {order.shippingAddress.fullName}
                  <br />
                  {order.shippingAddress.street}
                  <br />
                  {order.shippingAddress.city}
                  <br />
                  {order.shippingAddress.phone}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* ── Items ─────────────────────────────────────────────────── */}
      <div className="bdetail__panel">
        <h2 className="bdetail__panel-title">Items</h2>
        <div className="cart__items">
          {order.items.map((item) => (
            <div className="cart__item" key={item.productId}>
              <div className="cart__item-media">
                {item.image ? (
                  <Image src={item.image} alt={item.title} width={72} height={72} unoptimized />
                ) : (
                  <span className="pcard__placeholder" aria-hidden>
                    {item.brand.charAt(0)}
                  </span>
                )}
              </div>
              <div className="dash__card-info">
                <Link href={`/products/${item.productId}`} className="dash__card-title">
                  {item.title}
                </Link>
                <span className="dash__card-meta">
                  {item.brand} · {item.sellerName} · Qty {item.quantity}
                </span>
              </div>
              <span className="dash__card-price">
                ${(item.unitPrice * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
