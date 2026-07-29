import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import OrderDetail from "@/features/orders/components/OrderDetail";

export const metadata: Metadata = {
  title: "Order Tracking",
  description: "Follow your order through every delivery stage.",
};

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Order tracking page entry point — routing only, zero business logic.
 * All UI lives in features/orders/components/OrderDetail.
 */
export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params;

  return (
    <>
      <Navbar />
      <main className="flex-1 flex flex-col">
        <OrderDetail id={id} />
      </main>
      <Footer />
    </>
  );
}
