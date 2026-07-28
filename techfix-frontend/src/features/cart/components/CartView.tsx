"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart, FREE_SHIPPING_THRESHOLD } from "@/features/cart/CartProvider";

/**
 * Cart — feature UI only. Hands off to /checkout, which converts these
 * lines into a real order (the server re-prices every one of them).
 */
export default function CartView() {
  const { items, totals, isReady, removeItem, setQuantity, clear } = useCart();

  if (!isReady) {
    return (
      <section className="cart">
        <p style={{ color: "var(--color-text-muted)" }}>Loading your cart…</p>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="cart" aria-labelledby="cart-heading">
        <div className="dash__head">
          <h1 id="cart-heading" className="dash__title">
            Your Cart
          </h1>
        </div>
        <p className="dash__empty">
          Your cart is empty —{" "}
          <Link href="/products" style={{ color: "var(--color-action-secondary)" }}>
            browse products
          </Link>{" "}
          to get started.
        </p>
      </section>
    );
  }

  const awayFromFreeShipping = FREE_SHIPPING_THRESHOLD - totals.subtotal;

  return (
    <section className="cart" aria-labelledby="cart-heading">
      <div className="dash__head">
        <h1 id="cart-heading" className="dash__title">
          Your Cart
        </h1>
        <p className="dash__subtitle">
          {totals.itemCount} {totals.itemCount === 1 ? "item" : "items"}
        </p>
      </div>

      <div className="bdetail__grid">
        <div className="cart__items">
          {items.map((item) => (
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
                  {item.brand} · {item.sellerName}
                </span>
              </div>

              <div className="cart__qty">
                <button
                  type="button"
                  className="cart__qty-btn"
                  onClick={() => setQuantity(item.productId, item.quantity - 1)}
                  aria-label={`Decrease quantity of ${item.title}`}
                >
                  −
                </button>
                <span className="cart__qty-value">{item.quantity}</span>
                <button
                  type="button"
                  className="cart__qty-btn"
                  disabled={item.quantity >= item.maxStock}
                  onClick={() => setQuantity(item.productId, item.quantity + 1)}
                  aria-label={`Increase quantity of ${item.title}`}
                >
                  +
                </button>
              </div>

              <span className="dash__card-price">
                ${(item.price * item.quantity).toFixed(2)}
              </span>

              <button
                type="button"
                className="dash__card-view"
                onClick={() => removeItem(item.productId)}
              >
                Remove
              </button>
            </div>
          ))}

          <button type="button" className="lform__add" onClick={clear}>
            Clear cart
          </button>
        </div>

        <div className="bdetail__side">
          <div className="bdetail__panel">
            <h2 className="bdetail__panel-title">Order Summary</h2>
            <dl className="bdetail__rows">
              <div className="bdetail__row">
                <dt>Subtotal</dt>
                <dd>${totals.subtotal.toFixed(2)}</dd>
              </div>
              <div className="bdetail__row">
                <dt>Shipping</dt>
                <dd>{totals.shipping === 0 ? "Free" : `$${totals.shipping.toFixed(2)}`}</dd>
              </div>
              <div className="bdetail__row bdetail__row--total">
                <dt>Total</dt>
                <dd>${totals.total.toFixed(2)}</dd>
              </div>
            </dl>

            {awayFromFreeShipping > 0 && (
              <p className="lform__hint">
                Add ${awayFromFreeShipping.toFixed(2)} more for free shipping.
              </p>
            )}

            <Link href="/checkout" className="lform__submit cart__checkout">
              Proceed to Checkout
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
