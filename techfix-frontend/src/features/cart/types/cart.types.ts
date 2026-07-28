/**
 * A cart line. Price and title are snapshotted at add-time rather than
 * re-read from the product on every render — the same snapshot-vs-reference
 * decision the Booking model makes, so a seller's later price change never
 * silently alters what the shopper already agreed to see.
 */
export interface CartItem {
  productId: string;
  title: string;
  brand: string;
  price: number;
  image?: string;
  sellerName: string;
  /** Stock at add-time, used to cap quantity in the cart UI. */
  maxStock: number;
  quantity: number;
}

export interface CartTotals {
  itemCount: number;
  subtotal: number;
  shipping: number;
  total: number;
}
