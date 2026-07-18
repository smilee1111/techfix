import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AccountProfile from "@/features/auth/components/AccountProfile";

export const metadata: Metadata = {
  title: "Account",
  description: "Manage your TechFix account, repairs, and orders.",
};

/**
 * Account profile page entry point — routing only, zero business logic.
 * All UI lives in features/auth/components/AccountProfile.
 */
export default function AccountPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 flex flex-col">
        <AccountProfile />
      </main>
      <Footer />
    </>
  );
}
