import type { Metadata } from "next";
import { Suspense } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import RepairSearchResults from "@/features/repairs/components/RepairSearchResults";

export const metadata: Metadata = {
  title: "Find Repair Shops",
  description: "Search and compare verified repair shops near you in Kathmandu.",
};

/**
 * Repair search results page entry point — routing only, zero business logic.
 * All UI lives in features/repairs/components/RepairSearchResults.
 */
export default function RepairsPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 flex flex-col">
        <Suspense fallback={null}>
          <RepairSearchResults />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
