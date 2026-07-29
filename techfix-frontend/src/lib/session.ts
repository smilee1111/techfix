import { getAuthToken, setAuthToken, clearAuthCookies } from "@/lib/cookie";
import { ENDPOINTS } from "@/lib/endpoints";

/**
 * Decodes a JWT's payload without verifying its signature — fine here
 * since this only drives a client-side "should I bother refreshing?"
 * check. The backend still does real signature verification on every
 * request; this never substitutes for that.
 */
function getExpiry(token: string): number | null {
  try {
    const payload = token.split(".")[1];
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    const decoded = JSON.parse(json);
    return typeof decoded.exp === "number" ? decoded.exp : null;
  } catch {
    return null;
  }
}

function isExpiringSoon(token: string): boolean {
  const exp = getExpiry(token);
  if (exp === null) return true;
  const bufferSeconds = 10;
  return Date.now() / 1000 >= exp - bufferSeconds;
}

/**
 * Returns a valid access token, transparently refreshing it via the
 * backend's httpOnly refresh-token cookie when the current one is expired
 * (access tokens live 15 minutes — this is what makes "still looked logged
 * in overnight, then broke" possible without it). Must run in the browser,
 * not as a server action — the refresh-token cookie is scoped to the
 * backend's own origin, so only a real browser-issued fetch (`credentials:
 * "include"`) attaches it automatically.
 *
 * Returns null — and clears local session — if there's no token, or if
 * refreshing fails (refresh token itself expired/revoked). Callers should
 * treat null the same as "never logged in", not surface the raw error.
 */
export async function getValidAccessToken(): Promise<string | null> {
  const token = await getAuthToken();
  if (!token) return null;

  if (!isExpiringSoon(token)) return token;

  try {
    const response = await fetch(ENDPOINTS.auth.refresh, {
      method: "POST",
      credentials: "include",
    });

    if (!response.ok) {
      await clearAuthCookies();
      return null;
    }

    const result = await response.json();
    const newToken = result?.data?.accessToken as string | undefined;
    if (!newToken) {
      await clearAuthCookies();
      return null;
    }

    await setAuthToken(newToken);
    return newToken;
  } catch {
    await clearAuthCookies();
    return null;
  }
}
