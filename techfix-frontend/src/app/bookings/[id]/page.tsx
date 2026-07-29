import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BookingDetail from "@/features/bookings/components/BookingDetail";

export const metadata: Metadata = {
  title: "Repair Details",
  description: "Track the full progress of your repair, stage by stage.",
};

interface BookingDetailPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Booking detail page entry point — routing only, zero business logic.
 * All UI lives in features/bookings/components/BookingDetail.
 */
export default async function BookingDetailPage({ params }: BookingDetailPageProps) {
  const { id } = await params;

  return (
    <>
      <Navbar />
      <main className="flex-1 flex flex-col">
        <BookingDetail id={id} />
      </main>
      <Footer />
    </>
  );
}
