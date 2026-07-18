"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { resetPassword } from "@/features/auth/api/authApi";

interface UseResetPasswordReturn {
  isLoading: boolean;
  error: string | null;
  successMessage: string | null;
  submit: (token: string, newPassword: string) => Promise<void>;
}

/**
 * Custom hook wrapping the "reset password" completion flow.
 * On success, redirects to /login after a short delay.
 */
export function useResetPassword(): UseResetPasswordReturn {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const submit = useCallback(
    async (token: string, newPassword: string) => {
      setIsLoading(true);
      setError(null);
      setSuccessMessage(null);

      try {
        const message = await resetPassword(token, newPassword);
        setSuccessMessage(message);
        setTimeout(() => router.push("/login"), 1500);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setIsLoading(false);
      }
    },
    [router],
  );

  return { isLoading, error, successMessage, submit };
}
