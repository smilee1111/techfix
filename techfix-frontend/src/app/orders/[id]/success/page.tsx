import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import OrderSuccess from "@/features/orders/components/OrderSuccess";

export const metadata: Metadata = {
  title: "Order Confirmed",
  description: "Your order has been placed successfully.",
};

interface OrderSuccessPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Order success page entry point — routing only, zero business logic.
 * All UI lives in features/orders/components/OrderSuccess.
 */
export default async function OrderSuccessPage({ params }: OrderSuccessPageProps) {
  const { id } = await params;

  return (
    <>
      <Navbar />
      <main className="flex-1 flex flex-col">
        <OrderSuccess id={id} />
      </main>
      <Footer />
    </>
  );
}
