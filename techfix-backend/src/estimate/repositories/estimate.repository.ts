import RepairService from "../../repairs/models/repairService.model";
import Estimate, { IEstimateDocument } from "../models/estimate.model";
import { EstimateCalcResult } from "../types/estimate.type";

/**
 * Estimate Repository
 * The only layer that talks to MongoDB for estimates.
 */
export class EstimateRepository {
  /**
   * Computes an instant min/max price range and top matches from existing
   * active repair listings, using a text search on device type/title plus
   * an optional city filter. Falls back to a city-agnostic search if the
   * city filter matches nothing, so a typo'd or unlisted city never
   * produces a false "no shops" result.
   */
  async calculatePriceRange(
    deviceQuery: string,
    city: string
  ): Promise<EstimateCalcResult> {
    const textFilter = { $text: { $search: deviceQuery } };

    let matches = await RepairService.find({
      ...textFilter,
      isActive: true,
      "location.city": new RegExp(`^${city}$`, "i"),
    })
      .populate("provider", "name")
      .sort({ averageRating: -1 })
      .limit(20)
      .exec();

    if (matches.length === 0) {
      matches = await RepairService.find({ ...textFilter, isActive: true })
        .populate("provider", "name")
        .sort({ averageRating: -1 })
        .limit(20)
        .exec();
    }

    if (matches.length === 0) {
      return { estimatedMin: 0, estimatedMax: 0, matchedShopsCount: 0, topMatches: [] };
    }

    const mins = matches.map((m) => m.priceRange.min);
    const maxs = matches.map((m) => m.priceRange.max);

    const topMatches = matches.slice(0, 3).map((m) => ({
      repairService: m._id.toString(),
      providerName: (m.provider as unknown as { name: string }).name,
      price: m.priceRange.min,
      averageRating: m.averageRating,
    }));

    return {
      estimatedMin: Math.min(...mins),
      estimatedMax: Math.max(...maxs),
      matchedShopsCount: matches.length,
      topMatches,
    };
  }

  async create(data: Partial<IEstimateDocument>): Promise<IEstimateDocument> {
    const estimate = new Estimate(data);
    return estimate.save();
  }

  async findById(id: string): Promise<IEstimateDocument | null> {
    return Estimate.findById(id).populate("topMatches.repairService", "title").exec();
  }
}
