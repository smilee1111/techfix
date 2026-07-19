export interface IEstimateMatch {
  repairService: string;
  providerName: string;
  price: number;
  averageRating: number;
}

export interface EstimateCalcResult {
  estimatedMin: number;
  estimatedMax: number;
  matchedShopsCount: number;
  topMatches: IEstimateMatch[];
}
