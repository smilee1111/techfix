import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AdminPanel from "@/features/admin/components/AdminPanel";

export const metadata: Metadata = {
  title: "Admin Panel",
  description: "Manage the category taxonomy and seller verification.",
};

/**
 * Admin panel page entry point — routing only, zero business logic.
 * Access is gated by proxy.ts (adminOnlyPaths) at the edge and, more
 * importantly, by the admin-authorized endpoints on the backend.
 */
export default function AdminPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 flex flex-col">
        <AdminPanel />
      </main>
      <Footer />
    </>
  );
}
