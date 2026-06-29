import type {
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
} from "@/features/auth/types/auth.types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

/**
 * Authenticates a user with email and password.
 * All raw API calls are centralised here — never call fetch from components.
 */
export async function loginUser(credentials: LoginCredentials): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Login failed" }));
    throw new Error(error.message ?? "Invalid email or password");
  }

  return response.json();
}

/**
 * Registers a new user account.
 * All raw API calls are centralised here — never call fetch from components.
 */
export async function registerUser(
  credentials: RegisterCredentials,
): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Registration failed" }));
    throw new Error(error.message ?? "Could not create account");
  }

  return response.json();
}

/**
 * Placeholder for social OAuth login.
 * Redirects the browser to the backend OAuth flow.
 */
export function initiateOAuthLogin(provider: "google" | "facebook"): void {
  window.location.href = `${API_BASE_URL}/auth/${provider}`;
}

