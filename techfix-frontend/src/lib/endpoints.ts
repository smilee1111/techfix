const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

/**
 * Centrally managed API endpoints for the application.
 * Feature-wise grouping of URL endpoints.
 */
export const ENDPOINTS = {
  auth: {
    login: `${API_BASE_URL}/auth/login`,
    register: `${API_BASE_URL}/auth/register`,
    refresh: `${API_BASE_URL}/auth/refresh`,
    logout: `${API_BASE_URL}/auth/logout`,
    me: `${API_BASE_URL}/auth/me`,
    changePassword: `${API_BASE_URL}/auth/change-password`,
    addresses: `${API_BASE_URL}/auth/me/addresses`,
    removeAddress: (index: number) => `${API_BASE_URL}/auth/me/addresses/${index}`,
    socialLogin: (provider: "google" | "facebook") => `${API_BASE_URL}/auth/${provider}`,
  },
} as const;
