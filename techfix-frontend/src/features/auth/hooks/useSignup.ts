"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { registerUser } from "@/features/auth/api/authApi";
import type { RegisterCredentials, AuthUser } from "@/features/auth/types/auth.types";
import { setAuthToken, setUserData } from "@/lib/cookie";

interface UseSignupReturn {
  /** The newly registered user (null until success) */
  user: AuthUser | null;
  /** Whether a registration request is in flight */
  isLoading: boolean;
  /** Error message from the last failed attempt */
  error: string | null;
  /** Submit registration credentials */
  signup: (credentials: RegisterCredentials) => Promise<void>;
  /** Clear any existing error */
  clearError: () => void;
}

/**
 * Custom hook wrapping the registration flow.
 * Manages loading, error, and success states.
 * Calls authApi.registerUser — never raw fetch.
 */
export function useSignup(): UseSignupReturn {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signup = useCallback(
    async (credentials: RegisterCredentials) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await registerUser(credentials);

        // Store the access token in an httpOnly cookie via Server Action —
        // never mirror it into localStorage, or an XSS bug gets it for free.
        await setAuthToken(response.accessToken);
        await setUserData({
          id: response.user.id,
          fullName: response.user.fullName,
          email: response.user.email,
          role: response.user.role,
          avatarUrl: response.user.avatarUrl,
        });

        setUser(response.user);

        // Redirect to the dashboard on successful registration
        router.push("/dashboard");
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Something went wrong";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    },
    [router],
  );

  const clearError = useCallback(() => setError(null), []);

  return { user, isLoading, error, signup, clearError };
}
