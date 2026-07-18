"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { loginUser, logoutUser } from "@/features/auth/api/authApi";
import type { LoginCredentials, AuthUser } from "@/features/auth/types/auth.types";
import { setAuthToken, setUserData, clearAuthCookies, getAuthToken } from "@/lib/cookie";

interface UseAuthReturn {
  /** Currently authenticated user (null before login) */
  user: AuthUser | null;
  /** Whether a login request is in flight */
  isLoading: boolean;
  /** Error message from the last failed attempt */
  error: string | null;
  /** Submit login credentials */
  login: (credentials: LoginCredentials) => Promise<void>;
  /** Clear credentials and session */
  logout: () => void;
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

  const logout = useCallback(async () => {
    // Invalidate the refresh token server-side before clearing local cookies,
    // so a leaked cookie can't be replayed after the user thinks they're out.
    const token = await getAuthToken();
    if (token) {
      await logoutUser(token);
    }

    await clearAuthCookies();
    setUser(null);
    router.push("/login");
  }, [router]);

  const clearError = useCallback(() => setError(null), []);

  return { user, isLoading, error, login, logout, clearError };
}
