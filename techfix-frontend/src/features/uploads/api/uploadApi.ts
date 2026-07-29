import { ENDPOINTS } from "@/lib/endpoints";

/**
 * Uploads repair-issue photos and returns their permanent Cloudinary URLs.
 * All raw API calls are centralised here — never call fetch from components.
 */
export async function uploadRepairPhotos(accessToken: string, files: File[]): Promise<string[]> {
  const formData = new FormData();
  files.forEach((file) => formData.append("photos", file));

  const response = await fetch(ENDPOINTS.uploads.repairPhotos, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
    body: formData,
  });

  const result = await response.json().catch(() => ({ message: "Could not upload photos" }));
  if (!response.ok) {
    throw new Error(result.message ?? "Could not upload photos");
  }
  return result.data.urls as string[];
}
