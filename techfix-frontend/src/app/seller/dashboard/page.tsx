import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SellerDashboard from "@/features/bookings/components/SellerDashboard";

export const metadata: Metadata = {
  title: "Seller Dashboard",
  description: "Manage your repair listings and incoming bookings.",
};

/**
 * Seller dashboard page entry point — routing only, zero business logic.
 * All UI lives in features/bookings/components/SellerDashboard.
 */
export default function SellerDashboardPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 flex flex-col">
        <SellerDashboard />
      </main>
      <Footer />
    </>
  );
}
