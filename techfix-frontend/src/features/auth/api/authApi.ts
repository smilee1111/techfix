import type {
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
} from "@/features/auth/types/auth.types";
import { ENDPOINTS } from "@/lib/endpoints";

/**
 * Authenticates a user with email and password.
 * All raw API calls are centralised here — never call fetch from components.
 */
export async function loginUser(credentials: LoginCredentials): Promise<AuthResponse> {
  const response = await fetch(ENDPOINTS.auth.login, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Login failed" }));
    throw new Error(error.message ?? "Invalid email or password");
  }

  const result = await response.json();
  return {
    user: {
      id: result.data.user._id,
      fullName: result.data.user.name,
      email: result.data.user.email,
      role: result.data.user.role,
      avatarUrl: result.data.user.avatar,
    },
    accessToken: result.data.accessToken,
    refreshToken: "", // set in secure httpOnly cookie by backend
  };
}

/**
 * Registers a new user account.
 * All raw API calls are centralised here — never call fetch from components.
 */
export async function registerUser(
  credentials: RegisterCredentials,
): Promise<AuthResponse> {
  const payload = {
    name: credentials.fullName,
    email: credentials.email,
    phone: credentials.phone,
    password: credentials.password,
    role: credentials.role,
  };

  const response = await fetch(ENDPOINTS.auth.register, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Registration failed" }));
    throw new Error(error.message ?? "Could not create account");
  }

  const result = await response.json();
  return {
    user: {
      id: result.data.user._id,
      fullName: result.data.user.name,
      email: result.data.user.email,
      role: result.data.user.role,
      avatarUrl: result.data.user.avatar,
    },
    accessToken: result.data.accessToken,
    refreshToken: "", // set in secure httpOnly cookie by backend
  };
}

/**
 * Placeholder for social OAuth login.
 * Redirects the browser to the backend OAuth flow.
 */
export function initiateOAuthLogin(provider: "google" | "facebook"): void {
  window.location.href = ENDPOINTS.auth.socialLogin(provider);
}

