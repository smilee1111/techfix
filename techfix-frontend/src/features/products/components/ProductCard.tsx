"use client";

import Link from "next/link";
import Image from "next/image";
import {
  CONDITION_LABELS,
  AUTHENTICITY_LABELS,
  type Product,
} from "@/features/products/types/product.types";

interface ProductCardProps {
  product: Product;
  isSelected: boolean;
  onToggleCompare: (id: string) => void;
}

/**
 * One product tile in the listing grid.
 *
 * The card body is a link (largest possible target, Fitts's Law) while the
 * compare checkbox sits outside it — an interactive control cannot be
 * nested inside a link.
 */
export default function ProductCard({
  product,
  isSelected,
  onToggleCompare,
}: ProductCardProps) {
  const discounted = product.originalPrice && product.originalPrice > product.price;
  const outOfStock = product.stock === 0;

  return (
    <article className={`pcard ${outOfStock ? "pcard--out" : ""}`}>
      <Link href={`/products/${product.id}`} className="pcard__link">
        <div className="pcard__media">
          {product.images[0] ? (
            <Image
              src={product.images[0]}
              alt={product.title}
              width={280}
              height={180}
              unoptimized
            />
          ) : (
            <span className="pcard__placeholder" aria-hidden>
              {product.brand.charAt(0)}
            </span>
          )}
          {product.isVerified && <span className="pcard__verified">✓ Verified</span>}
        </div>

        <div className="pcard__body">
          <span className="pcard__brand">{product.brand}</span>
          <h3 className="pcard__title">{product.title}</h3>

          <div className="pcard__tags">
            <span className="pcard__tag">{CONDITION_LABELS[product.condition]}</span>
            <span className="pcard__tag">
              {AUTHENTICITY_LABELS[product.authenticityLabel]}
            </span>
          </div>

          <div className="pcard__meta">
            <span className="pcard__rating">
              ★ {product.averageRating.toFixed(1)}{" "}
              <span className="pcard__reviews">({product.totalReviews})</span>
            </span>
            <span className="pcard__seller">{product.seller.name}</span>
          </div>

          <div className="pcard__price-row">
            <span className="pcard__price">${product.price.toFixed(2)}</span>
            {discounted && (
              <span className="pcard__price-was">${product.originalPrice!.toFixed(2)}</span>
            )}
          </div>

          <span className={`pcard__stock ${outOfStock ? "pcard__stock--out" : ""}`}>
            {outOfStock ? "Out of stock" : `${product.stock} in stock`}
          </span>
        </div>
      </Link>

      <label className="pcard__compare">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleCompare(product.id)}
          aria-label={`Compare ${product.title}`}
        />
        <span>Compare</span>
      </label>
    </article>
  );
}
