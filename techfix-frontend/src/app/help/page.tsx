import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HelpCenter from "@/features/support/components/HelpCenter";

export const metadata: Metadata = {
  title: "Help Center",
  description: "Answers about repairs, orders, payments and your account.",
};

/**
 * Help Center page entry point — routing only, zero business logic.
 * All UI lives in features/support/components/HelpCenter.
 */
export default function HelpPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 flex flex-col">
        <HelpCenter />
      </main>
      <Footer />
    </>
  );
}
