import type {
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
  AccountProfile,
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
    credentials: "include",
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
    credentials: "include",
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

/**
 * Logs the user out server-side — invalidates the stored refresh token
 * so a leaked/old cookie can't be replayed after logout.
 */
export async function logoutUser(accessToken: string): Promise<void> {
  await fetch(ENDPOINTS.auth.logout, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
    credentials: "include",
  }).catch(() => {
    // Best-effort: still clear local session even if the API call fails
    // (e.g. token already expired) — logout must never get the user stuck.
  });
}

/**
 * Requests a password reset link. Always resolves with a generic message —
 * the backend never reveals whether the email exists.
 */
export async function forgotPassword(email: string): Promise<string> {
  const response = await fetch(ENDPOINTS.auth.forgotPassword, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  const result = await response.json().catch(() => ({ message: "Something went wrong" }));
  if (!response.ok) {
    throw new Error(result.message ?? "Could not send reset link");
  }
  return result.message as string;
}

/**
 * Completes a password reset using the token emailed to the user.
 */
export async function resetPassword(token: string, newPassword: string): Promise<string> {
  const response = await fetch(ENDPOINTS.auth.resetPassword, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, newPassword }),
  });

  const result = await response.json().catch(() => ({ message: "Something went wrong" }));
  if (!response.ok) {
    throw new Error(result.message ?? "Could not reset password");
  }
  return result.message as string;
}

function mapProfile(user: any): AccountProfile {
  return {
    id: user._id,
    fullName: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    avatarUrl: user.avatar,
    isVerified: user.isVerified,
    isVerifiedSeller: user.isVerifiedSeller,
    createdAt: user.createdAt,
  };
}

/**
 * Fetches the logged-in user's full profile. Requires a bearer access token.
 */
export async function getCurrentUser(accessToken: string): Promise<AccountProfile> {
  const response = await fetch(ENDPOINTS.auth.me, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const result = await response.json().catch(() => ({ message: "Could not load profile" }));
  if (!response.ok) {
    throw new Error(result.message ?? "Could not load profile");
  }
  return mapProfile(result.data.user);
}

/**
 * Updates the logged-in user's profile (name, phone, avatar).
 */
export async function updateProfile(
  accessToken: string,
  updates: { name?: string; phone?: string; avatar?: string },
): Promise<AccountProfile> {
  const response = await fetch(ENDPOINTS.auth.me, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(updates),
  });

  const result = await response.json().catch(() => ({ message: "Could not update profile" }));
  if (!response.ok) {
    throw new Error(result.message ?? "Could not update profile");
  }
  return mapProfile(result.data.user);
}

