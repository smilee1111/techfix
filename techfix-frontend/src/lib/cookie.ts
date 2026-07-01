"use server";
import { cookies } from "next/headers";

/**
 * Sets the authentication token in a secure cookie.
 */
export const setAuthToken = async (token: string) => {
  const cookieStore = await cookies();
  cookieStore.set({
    name: "auth_token",
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  });
};

/**
 * Gets the authentication token from cookies.
 */
export const getAuthToken = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  return token;
};

/**
 * Stores serialized user data in a cookie.
 */
export const setUserData = async (userData: any) => {
  const cookieStore = await cookies();
  cookieStore.set({
    name: "user_data",
    value: JSON.stringify(userData),
    httpOnly: false, // Accessible to client-side if needed
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  });
};

/**
 * Retrives and parses user data from cookies.
 */
export const getUserData = async () => {
  const cookieStore = await cookies();
  const userDataStr = cookieStore.get("user_data")?.value;
  if (userDataStr) {
    try {
      return JSON.parse(userDataStr);
    } catch {
      return null;
    }
  }
  return null;
};

/**
 * Clears all authentication cookies on logout.
 */
export const clearAuthCookies = async () => {
  const cookieStore = await cookies();
  cookieStore.delete("auth_token");
  cookieStore.delete("user_data");
};
