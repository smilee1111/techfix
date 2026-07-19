export interface EstimateMatch {
  repairServiceId: string;
  providerName: string;
  price: number;
  averageRating: number;
}

export interface EstimateRequest {
  brand: string;
  deviceModel: string;
  issueType: string;
  city: string;
}

export interface EstimateResult {
  id: string;
  brand: string;
  deviceModel: string;
  issueType: string;
  city: string;
  estimatedMin: number;
  estimatedMax: number;
  matchedShopsCount: number;
  topMatches: EstimateMatch[];
}
