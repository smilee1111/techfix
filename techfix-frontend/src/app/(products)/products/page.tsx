import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductListing from "@/features/products/components/ProductListing";

export const metadata: Metadata = {
  title: "Products",
  description: "Genuine parts and certified devices from verified sellers.",
};

/**
 * Product listing page entry point — routing only, zero business logic.
 * All UI lives in features/products/components/ProductListing.
 */
export default function ProductsPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 flex flex-col">
        <ProductListing />
      </main>
      <Footer />
    </>
  );
}
