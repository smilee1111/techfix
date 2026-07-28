import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Checkout from "@/features/orders/components/Checkout";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Confirm delivery details and place your order.",
};

/**
 * Checkout page entry point — routing only, zero business logic.
 * All UI lives in features/orders/components/Checkout.
 */
export default function CheckoutPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 flex flex-col">
        <Checkout />
      </main>
      <Footer />
    </>
  );
}
