"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import BookingForm from "@/features/bookings/components/BookingForm";

interface BookingFormLoaderProps {
  repairServiceId: string;
}

/**
 * Reads the selected repair option (name + price) out of the query string
 * and hands it to BookingForm. Split out so the page itself doesn't need
 * to be a client component just to call useSearchParams.
 */
export default function BookingFormLoader({ repairServiceId }: BookingFormLoaderProps) {
  const searchParams = useSearchParams();
  const option = searchParams.get("option");
  const price = Number(searchParams.get("price"));

  if (!option || !price || Number.isNaN(price)) {
    return (
      <section className="booking-form">
        <div className="fp__error" role="alert">
          No repair option was selected.{" "}
          <Link href={`/repairs/${repairServiceId}`} style={{ color: "var(--color-action-secondary)" }}>
            Go back and choose one
          </Link>
          .
        </div>
      </section>
    );
  }

  return <BookingForm repairServiceId={repairServiceId} repairOptionName={option} price={price} />;
}
