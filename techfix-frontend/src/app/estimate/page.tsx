import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import EstimateForm from "@/features/estimate/components/EstimateForm";

export const metadata: Metadata = {
  title: "Get a Free Repair Estimate",
  description: "Tell us about your device and get an instant repair cost estimate.",
};

/**
 * Estimate form page entry point — routing only, zero business logic.
 * All UI lives in features/estimate/components/EstimateForm.
 */
export default function EstimatePage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 flex flex-col">
        <EstimateForm />
      </main>
      <Footer />
    </>
  );
}
