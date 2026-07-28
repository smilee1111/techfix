import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductDetail from "@/features/products/components/ProductDetail";

export const metadata: Metadata = {
  title: "Product Details",
  description: "Specifications, authenticity verification and seller details.",
};

interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Product detail page entry point — routing only, zero business logic.
 * All UI lives in features/products/components/ProductDetail.
 */
export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = await params;

  return (
    <>
      <Navbar />
      <main className="flex-1 flex flex-col">
        <ProductDetail id={id} />
      </main>
      <Footer />
    </>
  );
}
