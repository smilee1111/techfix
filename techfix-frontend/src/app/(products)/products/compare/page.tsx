import type { Metadata } from "next";
import { Suspense } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CompareSellers from "@/features/products/components/CompareSellers";

export const metadata: Metadata = {
  title: "Compare Sellers",
  description: "Compare price, condition, authenticity and warranty across sellers.",
};

/**
 * Seller comparison page entry point — routing only, zero business logic.
 * All UI lives in features/products/components/CompareSellers.
 */
export default function CompareSellersPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 flex flex-col">
        <Suspense fallback={null}>
          <CompareSellers />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
