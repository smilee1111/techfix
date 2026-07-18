/** Credentials sent to POST /api/auth/login */
export interface LoginCredentials {
  email: string;
  password: string;
}

/** Credentials sent to POST /api/auth/register */
export interface RegisterCredentials {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  role: "customer" | "seller";
}

/** Shape of the authenticated user returned from the API */
export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: "customer" | "seller" | "admin";
  avatarUrl?: string;
}

/** Successful auth response from the API */
export interface AuthResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

/** Possible auth error codes from the backend */
export type AuthErrorCode =
  | "INVALID_CREDENTIALS"
  | "EMAIL_ALREADY_EXISTS"
  | "ACCOUNT_LOCKED"
  | "NETWORK_ERROR";

/** Full profile shape returned from GET /api/auth/me */
export interface AccountProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: "customer" | "seller" | "repair_provider" | "admin";
  avatarUrl?: string;
  isVerified: boolean;
  isVerifiedSeller: boolean;
  createdAt: string;
}
