import type { Metadata } from "next";
import { Suspense } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BookingFormLoader from "@/features/bookings/components/BookingFormLoader";

export const metadata: Metadata = {
  title: "Booking Form",
  description: "Configure your repair service and schedule a pickup.",
};

interface BookingPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Booking form page entry point — routing only, zero business logic.
 * All UI lives in features/bookings/components/BookingForm.
 */
export default async function BookingPage({ params }: BookingPageProps) {
  const { id } = await params;

  return (
    <>
      <Navbar />
      <main className="flex-1 flex flex-col">
        <Suspense fallback={null}>
          <BookingFormLoader repairServiceId={id} />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
