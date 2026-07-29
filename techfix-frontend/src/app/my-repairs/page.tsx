import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import MyRepairs from "@/features/bookings/components/MyRepairs";

export const metadata: Metadata = {
  title: "My Repairs",
  description: "Track the status of every repair you've booked.",
};

/**
 * My Repairs page entry point — routing only, zero business logic.
 * All UI lives in features/bookings/components/MyRepairs.
 */
export default function MyRepairsPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 flex flex-col">
        <MyRepairs />
      </main>
      <Footer />
    </>
  );
}
