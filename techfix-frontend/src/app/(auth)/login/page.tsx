import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import LoginForm from "@/features/auth/components/LoginForm";

export const metadata: Metadata = {
  title: "Sign In",
  description:
    "Sign in to your TechFix account to access your dashboard, track repairs, and manage orders.",
};

/**
 * Login page entry point — routing only, zero business logic.
 * All auth UI lives in features/auth/components/LoginForm.
 */
export default function LoginPage() {
  return (
    <>
      <Navbar variant="loggedOut" />
      <main>
        <LoginForm />
      </main>
      <Footer />
    </>
  );
}
