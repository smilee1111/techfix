/**
 * Carries the issue description + uploaded photo URLs captured on the
 * Service Detail page across the navigation to the Booking Form page.
 * sessionStorage (not a global store) is enough here — it's a single,
 * short-lived handoff between two pages in the same tab, not app state.
 */

interface PendingIssue {
  description: string;
  photoUrls: string[];
}

function keyFor(repairServiceId: string): string {
  return `techfix:pending-issue:${repairServiceId}`;
}

export function savePendingIssue(repairServiceId: string, issue: PendingIssue): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(keyFor(repairServiceId), JSON.stringify(issue));
}

export function readPendingIssue(repairServiceId: string): PendingIssue | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(keyFor(repairServiceId));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PendingIssue;
  } catch {
    return null;
  }
}

export function clearPendingIssue(repairServiceId: string): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(keyFor(repairServiceId));
}
