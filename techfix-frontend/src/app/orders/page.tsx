import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import OrderHistory from "@/features/orders/components/OrderHistory";

export const metadata: Metadata = {
  title: "Order History",
  description: "Track every product order you've placed.",
};

/**
 * Order history page entry point — routing only, zero business logic.
 * All UI lives in features/orders/components/OrderHistory.
 */
export default function OrdersPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 flex flex-col">
        <OrderHistory />
      </main>
      <Footer />
    </>
  );
}
