import type { Metadata } from "next";
import { Suspense } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ResetPasswordForm from "@/features/auth/components/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Set New Password",
  description: "Complete your TechFix password reset.",
};

/**
 * Reset password page entry point — routing only, zero business logic.
 * All UI lives in features/auth/components/ResetPasswordForm.
 */
export default function ResetPasswordPage() {
  return (
    <>
      <Navbar variant="loggedOut" />
      <main>
        <Suspense fallback={null}>
          <ResetPasswordForm />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
