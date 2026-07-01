import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SignupForm from "@/features/auth/components/SignupForm";

export const metadata: Metadata = {
  title: "Create Account",
  description:
    "Create your TechFix account to book repairs, shop certified tech products, and track your orders.",
};

/**
 * Signup page entry point — routing only, zero business logic.
 * All auth UI lives in features/auth/components/SignupForm.
 */
export default function SignupPage() {
  return (
    <>
      <Navbar variant="loggedOut" />
      <main>
        <SignupForm />
      </main>
      <Footer />
    </>
  );
}
