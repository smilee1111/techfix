import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BookingSuccess from "@/features/bookings/components/BookingSuccess";

export const metadata: Metadata = {
  title: "Booking Confirmed",
  description: "Your repair booking has been confirmed.",
};

interface BookingSuccessPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Booking success page entry point — routing only, zero business logic.
 * All UI lives in features/bookings/components/BookingSuccess.
 */
export default async function BookingSuccessPage({ params }: BookingSuccessPageProps) {
  const { id } = await params;

  return (
    <>
      <Navbar />
      <main className="flex-1 flex flex-col">
        <BookingSuccess id={id} />
      </main>
      <Footer />
    </>
  );
}
