import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ForgotPasswordForm from "@/features/auth/components/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Request a password reset link for your TechFix account.",
};

/**
 * Forgot password page entry point — routing only, zero business logic.
 * All UI lives in features/auth/components/ForgotPasswordForm.
 */
export default function ForgotPasswordPage() {
  return (
    <>
      <Navbar variant="loggedOut" />
      <main>
        <ForgotPasswordForm />
      </main>
      <Footer />
    </>
  );
}
