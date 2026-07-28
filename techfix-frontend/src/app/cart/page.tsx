import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CartView from "@/features/cart/components/CartView";

export const metadata: Metadata = {
  title: "Cart",
  description: "Review the products you've selected before checking out.",
};

/**
 * Cart page entry point — routing only, zero business logic.
 * All UI lives in features/cart/components/CartView.
 */
export default function CartPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 flex flex-col">
        <CartView />
      </main>
      <Footer />
    </>
  );
}
