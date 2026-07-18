import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ServiceDetail from "@/features/repairs/components/ServiceDetail";

export const metadata: Metadata = {
  title: "Repair Service Detail",
  description: "View repair options, pricing, and book a certified repair provider.",
};

interface ServiceDetailPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Repair service detail page entry point — routing only, zero business logic.
 * All UI lives in features/repairs/components/ServiceDetail.
 */
export default async function ServiceDetailPage({ params }: ServiceDetailPageProps) {
  const { id } = await params;

  return (
    <>
      <Navbar />
      <main className="flex-1 flex flex-col">
        <ServiceDetail id={id} />
      </main>
      <Footer />
    </>
  );
}
