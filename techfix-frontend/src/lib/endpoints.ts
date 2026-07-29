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
    forgotPassword: `${API_BASE_URL}/auth/forgot-password`,
    resetPassword: `${API_BASE_URL}/auth/reset-password`,
    addresses: `${API_BASE_URL}/auth/me/addresses`,
    removeAddress: (index: number) => `${API_BASE_URL}/auth/me/addresses/${index}`,
    users: (role?: string) =>
      role ? `${API_BASE_URL}/auth/users?role=${role}` : `${API_BASE_URL}/auth/users`,
    verifySeller: (id: string) => `${API_BASE_URL}/auth/users/${id}/verify-seller`,
    socialLogin: (provider: "google" | "facebook") => `${API_BASE_URL}/auth/${provider}`,
  },
  repairs: {
    search: `${API_BASE_URL}/repairs`,
    getById: (id: string) => `${API_BASE_URL}/repairs/${id}`,
    compare: (ids: string[]) => `${API_BASE_URL}/repairs/compare?ids=${ids.join(",")}`,
    mine: `${API_BASE_URL}/repairs/mine`,
    create: `${API_BASE_URL}/repairs`,
    update: (id: string) => `${API_BASE_URL}/repairs/${id}`,
    setActive: (id: string) => `${API_BASE_URL}/repairs/${id}/active`,
    setVerified: (id: string) => `${API_BASE_URL}/repairs/${id}/verify`,
  },
  categories: {
    list: `${API_BASE_URL}/categories`,
    byType: (type: "repair" | "product") => `${API_BASE_URL}/categories?type=${type}`,
    create: `${API_BASE_URL}/categories`,
    update: (id: string) => `${API_BASE_URL}/categories/${id}`,
    remove: (id: string) => `${API_BASE_URL}/categories/${id}`,
  },
  estimates: {
    create: `${API_BASE_URL}/estimates`,
    getById: (id: string) => `${API_BASE_URL}/estimates/${id}`,
  },
  bookings: {
    create: `${API_BASE_URL}/bookings`,
    getById: (id: string) => `${API_BASE_URL}/bookings/${id}`,
    mine: `${API_BASE_URL}/bookings/mine`,
    incoming: `${API_BASE_URL}/bookings/incoming`,
    updateStatus: (id: string) => `${API_BASE_URL}/bookings/${id}/status`,
    statusHistory: (id: string) => `${API_BASE_URL}/bookings/${id}/status`,
  },
  products: {
    search: `${API_BASE_URL}/products`,
    getById: (id: string) => `${API_BASE_URL}/products/${id}`,
    compare: (ids: string[]) => `${API_BASE_URL}/products/compare?ids=${ids.join(",")}`,
    brands: `${API_BASE_URL}/products/brands`,
    mine: `${API_BASE_URL}/products/mine`,
    create: `${API_BASE_URL}/products`,
    update: (id: string) => `${API_BASE_URL}/products/${id}`,
    setActive: (id: string) => `${API_BASE_URL}/products/${id}/active`,
    setVerified: (id: string) => `${API_BASE_URL}/products/${id}/verify`,
  },
  reviews: {
    list: (targetType: string, target: string) =>
      `${API_BASE_URL}/reviews?targetType=${targetType}&target=${target}`,
    create: `${API_BASE_URL}/reviews`,
  },
  uploads: {
    repairPhotos: `${API_BASE_URL}/uploads/repair-photos`,
  },
} as const;
