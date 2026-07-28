import type { Metadata } from "next";
import { Suspense } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import GlobalSearch from "@/features/support/components/GlobalSearch";

export const metadata: Metadata = {
  title: "Search",
  description: "Search across repair services and tech products.",
};

/**
 * Global search page entry point — routing only, zero business logic.
 * All UI lives in features/support/components/GlobalSearch.
 */
export default function SearchPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 flex flex-col">
        <Suspense fallback={null}>
          <GlobalSearch />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
