export type UserRole = "customer" | "seller" | "admin";

/** A row in the admin panel's user directory. */
export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  isVerified: boolean;
  isVerifiedSeller: boolean;
  createdAt: string;
}
