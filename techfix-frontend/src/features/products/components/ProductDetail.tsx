"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useProductDetail } from "@/features/products/hooks/useProductDetail";
import { useCart } from "@/features/cart/CartProvider";
import {
  CONDITION_LABELS,
  AUTHENTICITY_LABELS,
} from "@/features/products/types/product.types";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

interface ProductDetailProps {
  id: string;
}

/**
 * Product detail + authenticity verification — feature UI only.
 *
 * The authenticity panel is the reason this page exists: App_info.md names
 * trust as the platform's core priority, and "verify product authenticity"
 * as the product side's version of it. Each check is shown individually,
 * including the ones that failed — a panel that only ever showed passes
 * would be marketing, not verification.
 */
export default function ProductDetail({ id }: ProductDetailProps) {
  const { product, reviews, isLoading, error } = useProductDetail(id);
  const { addItem } = useCart();
  const [activeImage, setActiveImage] = useState(0);
  const [added, setAdded] = useState(false);

  if (isLoading) {
    return (
      <section className="pdetail">
        <p style={{ color: "var(--color-text-muted)" }}>Loading product…</p>
      </section>
    );
  }

  if (error || !product) {
    return (
      <section className="pdetail">
        <div className="fp__error" role="alert">
          {error ?? "This product could not be found."}
        </div>
        <Link href="/products" className="bdetail__back">
          ← Back to Products
        </Link>
      </section>
    );
  }

  const outOfStock = product.stock === 0;
  const discounted = product.originalPrice && product.originalPrice > product.price;
  const passedChecks = product.authenticityChecks.filter((c) => c.passed).length;

  function handleAddToCart() {
    if (!product || outOfStock) return;
    addItem({
      productId: product.id,
      title: product.title,
      brand: product.brand,
      price: product.price,
      image: product.images[0],
      sellerName: product.seller.name,
      maxStock: product.stock,
    });
    setAdded(true);
  }

  return (
    <section className="pdetail" aria-labelledby="pdetail-heading">
      <Link href="/products" className="bdetail__back">
        ← Back to Products
      </Link>

      <div className="pdetail__top">
        {/* ── Gallery ──────────────────────────────────────────────── */}
        <div className="pdetail__gallery">
          <div className="pdetail__main-image">
            {product.images[activeImage] ? (
              <Image
                src={product.images[activeImage]}
                alt={product.title}
                width={520}
                height={380}
                unoptimized
              />
            ) : (
              <span className="pcard__placeholder" aria-hidden>
                {product.brand.charAt(0)}
              </span>
            )}
          </div>

          {product.images.length > 1 && (
            <div className="pdetail__thumbs">
              {product.images.map((url, index) => (
                <button
                  key={url}
                  type="button"
                  className={`pdetail__thumb ${index === activeImage ? "pdetail__thumb--active" : ""}`}
                  onClick={() => setActiveImage(index)}
                  aria-label={`View image ${index + 1}`}
                >
                  <Image src={url} alt="" width={64} height={64} unoptimized />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Buy box ──────────────────────────────────────────────── */}
        <div className="pdetail__buy">
          <span className="pcard__brand">{product.brand}</span>
          <h1 id="pdetail-heading" className="pdetail__title">
            {product.title}
          </h1>

          <div className="pcard__meta">
            <span className="pcard__rating">
              ★ {product.averageRating.toFixed(1)}{" "}
              <span className="pcard__reviews">({product.totalReviews} reviews)</span>
            </span>
          </div>

          <div className="pcard__tags">
            <span className="pcard__tag">{CONDITION_LABELS[product.condition]}</span>
            <span className="pcard__tag">
              {AUTHENTICITY_LABELS[product.authenticityLabel]}
            </span>
            {product.isVerified && <span className="pcard__verified">✓ Verified</span>}
          </div>

          <div className="pcard__price-row">
            <span className="pdetail__price">${product.price.toFixed(2)}</span>
            {discounted && (
              <span className="pcard__price-was">${product.originalPrice!.toFixed(2)}</span>
            )}
          </div>

          <p className="pdetail__description">{product.description}</p>

          <dl className="bdetail__rows">
            <div className="bdetail__row">
              <dt>Seller</dt>
              <dd>
                {product.seller.name}
                {product.seller.isVerifiedSeller && " ✓"}
              </dd>
            </div>
            <div className="bdetail__row">
              <dt>Location</dt>
              <dd>{product.city}</dd>
            </div>
            {product.warranty && (
              <div className="bdetail__row">
                <dt>Warranty</dt>
                <dd>{product.warranty}</dd>
              </div>
            )}
            <div className="bdetail__row">
              <dt>Availability</dt>
              <dd className={outOfStock ? "pcard__stock--out" : ""}>
                {outOfStock ? "Out of stock" : `${product.stock} in stock`}
              </dd>
            </div>
          </dl>

          <button
            type="button"
            className="lform__submit pdetail__add"
            disabled={outOfStock}
            onClick={handleAddToCart}
          >
            {outOfStock ? "Out of Stock" : added ? "Added ✓ — Add Another" : "Add to Cart"}
          </button>

          {added && (
            <Link href="/cart" className="bdetail__back">
              View cart →
            </Link>
          )}
        </div>
      </div>

      <div className="bdetail__grid">
        {/* ── Authenticity ─────────────────────────────────────────── */}
        <div className="bdetail__panel">
          <h2 className="bdetail__panel-title">Authenticity Verification</h2>
          <p className="lform__hint">
            {passedChecks} of {product.authenticityChecks.length} checks passed
            {product.certificateId ? ` · Certificate ${product.certificateId}` : ""}
          </p>

          {product.authenticityChecks.length === 0 ? (
            <p className="dash__empty">
              This seller has not submitted authenticity checks for this item.
            </p>
          ) : (
            <ul className="pdetail__checks">
              {product.authenticityChecks.map((check) => (
                <li
                  key={check.label}
                  className={`pdetail__check ${check.passed ? "" : "pdetail__check--failed"}`}
                >
                  <span className="pdetail__check-mark" aria-hidden>
                    {check.passed ? "✓" : "✕"}
                  </span>
                  <span>{check.label}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ── Specs & compatibility ────────────────────────────────── */}
        <div className="bdetail__side">
          {product.specs.length > 0 && (
            <div className="bdetail__panel">
              <h2 className="bdetail__panel-title">Specifications</h2>
              <dl className="bdetail__rows">
                {product.specs.map((spec) => (
                  <div className="bdetail__row" key={spec.label}>
                    <dt>{spec.label}</dt>
                    <dd>{spec.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {product.compatibility.length > 0 && (
            <div className="bdetail__panel">
              <h2 className="bdetail__panel-title">Compatibility</h2>
              <div className="pcard__tags">
                {product.compatibility.map((item) => (
                  <span className="pcard__tag" key={item}>
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Reviews ────────────────────────────────────────────────── */}
      <div className="bdetail__panel">
        <h2 className="bdetail__panel-title">Reviews</h2>
        {reviews.length === 0 ? (
          <p className="dash__empty">No reviews yet for this product.</p>
        ) : (
          <div className="pdetail__reviews">
            {reviews.map((review) => (
              <div className="pdetail__review" key={review.id}>
                <div className="pdetail__review-head">
                  <span className="pcard__rating">
                    {"★".repeat(review.rating)}
                    <span className="pcard__reviews">{"★".repeat(5 - review.rating)}</span>
                  </span>
                  <span className="timeline__time">{formatDate(review.createdAt)}</span>
                </div>
                <span className="timeline__author">{review.authorName}</span>
                {review.comment && <p className="timeline__note">{review.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
