import { ENDPOINTS } from "@/lib/endpoints";
import type { EstimateRequest, EstimateResult } from "@/features/estimate/types/estimate.types";

/* eslint-disable @typescript-eslint/no-explicit-any */

function mapEstimate(raw: any): EstimateResult {
  return {
    id: raw._id,
    brand: raw.brand,
    deviceModel: raw.deviceModel,
    issueType: raw.issueType,
    city: raw.city,
    estimatedMin: raw.estimatedMin,
    estimatedMax: raw.estimatedMax,
    matchedShopsCount: raw.matchedShopsCount,
    topMatches: (raw.topMatches ?? []).map((m: any) => ({
      repairServiceId: m.repairService?._id ?? m.repairService,
      providerName: m.providerName,
      price: m.price,
      averageRating: m.averageRating,
    })),
  };
}

/**
 * Requests an instant price-range estimate. No auth required.
 * All raw API calls are centralised here — never call fetch from components.
 */
export async function createEstimate(request: EstimateRequest): Promise<EstimateResult> {
  const response = await fetch(ENDPOINTS.estimates.create, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  const result = await response.json().catch(() => ({ message: "Could not calculate estimate" }));
  if (!response.ok) {
    throw new Error(result.message ?? "Could not calculate estimate");
  }
  return mapEstimate(result.data.estimate);
}

/**
 * Fetches a previously calculated estimate by id.
 */
export async function getEstimateById(id: string): Promise<EstimateResult> {
  const response = await fetch(ENDPOINTS.estimates.getById(id));

  const result = await response.json().catch(() => ({ message: "Could not load estimate" }));
  if (!response.ok) {
    throw new Error(result.message ?? "Could not load estimate");
  }
  return mapEstimate(result.data.estimate);
}
