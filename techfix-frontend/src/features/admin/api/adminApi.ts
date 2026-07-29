import { ENDPOINTS } from "@/lib/endpoints";
import type { AdminUser, UserRole } from "@/features/admin/types/admin.types";

/* eslint-disable @typescript-eslint/no-explicit-any */

function mapUser(raw: any): AdminUser {
  return {
    id: raw._id,
    name: raw.name,
    email: raw.email,
    phone: raw.phone,
    role: raw.role,
    isVerified: !!raw.isVerified,
    isVerifiedSeller: !!raw.isVerifiedSeller,
    createdAt: raw.createdAt,
  };
}

async function parseOrThrow(response: Response, fallback: string) {
  const result = await response.json().catch(() => ({ message: fallback }));
  if (!response.ok) {
    throw new Error(result.message ?? fallback);
  }
  return result;
}

/**
 * The user directory, optionally narrowed by role. Admin only.
 * All raw API calls are centralised here — never call fetch from components.
 */
export async function getUsers(accessToken: string, role?: UserRole): Promise<AdminUser[]> {
  const response = await fetch(ENDPOINTS.auth.users(role), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const result = await parseOrThrow(response, "Could not load users");
  return (result.data.users ?? []).map(mapUser);
}

/** Grants or revokes a seller's verified badge. Admin only. */
export async function setSellerVerified(
  accessToken: string,
  userId: string,
  isVerifiedSeller: boolean,
): Promise<AdminUser> {
  const response = await fetch(ENDPOINTS.auth.verifySeller(userId), {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ isVerifiedSeller }),
  });
  const result = await parseOrThrow(response, "Could not update seller verification");
  return mapUser(result.data.user);
}
