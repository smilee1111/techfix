"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "@/features/auth/api/authApi";
import type { LoginCredentials, AuthUser } from "@/features/auth/types/auth.types";

interface UseAuthReturn {
  /** Currently authenticated user (null before login) */
  user: AuthUser | null;
  /** Whether a login request is in flight */
  isLoading: boolean;
  /** Error message from the last failed attempt */
  error: string | null;
  /** Submit login credentials */
  login: (credentials: LoginCredentials) => Promise<void>;
  /** Clear any existing error */
  clearError: () => void;
}

/**
 * Custom hook that wraps the login flow.
 * Manages loading, error and success states.
 * Calls authApi.loginUser — never raw fetch.
 */
export function useAuth(): UseAuthReturn {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await loginUser(credentials);

        // Store token — in production use httpOnly cookies via the backend
        if (typeof window !== "undefined") {
          localStorage.setItem("accessToken", response.accessToken);
        }

        setUser(response.user);

        // Redirect to the dashboard on successful login
        router.push("/dashboard");
      } catch (err) {
        const message = err instanceof Error ? err.message : "Something went wrong";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    },
    [router],
  );

  const clearError = useCallback(() => setError(null), []);

  return { user, isLoading, error, login, clearError };
}
