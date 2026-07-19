import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import EstimateResult from "@/features/estimate/components/EstimateResult";

export const metadata: Metadata = {
  title: "Your Repair Estimate",
  description: "Estimated repair costs from certified shops near you.",
};

interface EstimateResultPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Estimate results page entry point — routing only, zero business logic.
 * All UI lives in features/estimate/components/EstimateResult.
 */
export default async function EstimateResultPage({ params }: EstimateResultPageProps) {
  const { id } = await params;

  return (
    <>
      <Navbar />
      <main className="flex-1 flex flex-col">
        <EstimateResult id={id} />
      </main>
      <Footer />
    </>
  );
}
