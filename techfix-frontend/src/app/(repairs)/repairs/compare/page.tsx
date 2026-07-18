import type { Metadata } from "next";
import { Suspense } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ComparisonView from "@/features/repairs/components/ComparisonView";

export const metadata: Metadata = {
  title: "Compare Repair Shops",
  description: "Compare price, rating, distance, and warranty across repair providers.",
};

/**
 * Repair comparison page entry point — routing only, zero business logic.
 * All UI lives in features/repairs/components/ComparisonView.
 */
export default function RepairComparePage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 flex flex-col">
        <Suspense fallback={null}>
          <ComparisonView />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
