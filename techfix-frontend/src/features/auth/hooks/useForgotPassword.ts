"use client";

import { useState, useCallback } from "react";
import { forgotPassword } from "@/features/auth/api/authApi";

interface UseForgotPasswordReturn {
  isLoading: boolean;
  error: string | null;
  successMessage: string | null;
  submit: (email: string) => Promise<void>;
}

/**
 * Custom hook wrapping the "forgot password" request flow.
 * Calls authApi.forgotPassword — never raw fetch.
 */
export function useForgotPassword(): UseForgotPasswordReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const submit = useCallback(async (email: string) => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const message = await forgotPassword(email);
      setSuccessMessage(message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { isLoading, error, successMessage, submit };
}
