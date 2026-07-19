import mongoose, { PipelineStage } from "mongoose";
import RepairService, { IRepairServiceDocument } from "../models/repairService.model";
import { RepairSearchFilters } from "../types/repair.type";

const PROVIDER_FIELDS = "name avatar isVerifiedSeller";
const CATEGORY_FIELDS = "name slug";

/**
 * Repair Repository
 * The only layer that talks to MongoDB for repair service listings.
 */
export class RepairRepository {
  async create(data: Partial<IRepairServiceDocument>): Promise<IRepairServiceDocument> {
    const repairService = new RepairService(data);
    return repairService.save();
  }

  async findById(id: string): Promise<IRepairServiceDocument | null> {
    return RepairService.findOne({ _id: id, isActive: true })
      .populate("provider", PROVIDER_FIELDS)
      .populate("category", CATEGORY_FIELDS)
      .exec();
  }

  async findByIds(ids: string[]): Promise<IRepairServiceDocument[]> {
    return RepairService.find({ _id: { $in: ids }, isActive: true })
      .populate("provider", PROVIDER_FIELDS)
      .populate("category", CATEGORY_FIELDS)
      .exec();
  }

  /**
   * A seller's own listings, including inactive ones — unlike the public
   * find methods, this intentionally does not filter by isActive so a
   * seller can see (and eventually re-activate) everything they own.
   */
  async findByProvider(providerId: string): Promise<IRepairServiceDocument[]> {
    return RepairService.find({ provider: providerId })
      .populate("category", CATEGORY_FIELDS)
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Search/list repair services with filters, sorting and pagination.
   * Uses $geoNear (via aggregation) when the caller supplies a location,
   * since $geoNear must be the first stage and needs the 2dsphere index.
   */
  async search(
    filters: RepairSearchFilters
  ): Promise<{ items: IRepairServiceDocument[]; total: number }> {
    const match: Record<string, unknown> = { isActive: true };

    if (filters.q) {
      match.$text = { $search: filters.q };
    }
    if (filters.category) {
      match.category = new mongoose.Types.ObjectId(filters.category);
    }
    if (filters.minRating !== undefined) {
      match.averageRating = { $gte: filters.minRating };
    }
    if (filters.warrantyOnly) {
      match.warranty = { $exists: true, $nin: [null, ""] };
    }
    if (filters.serviceType && filters.serviceType !== "both") {
      match.serviceOptions = filters.serviceType;
    }
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      match["priceRange.min"] = {
        ...(filters.minPrice !== undefined && { $gte: filters.minPrice }),
        ...(filters.maxPrice !== undefined && { $lte: filters.maxPrice }),
      };
    }

    const skip = (filters.page - 1) * filters.limit;
    const hasGeo = filters.lat !== undefined && filters.lng !== undefined;

    if (hasGeo) {
      const pipeline: PipelineStage[] = [
        {
          $geoNear: {
            near: { type: "Point", coordinates: [filters.lng!, filters.lat!] },
            distanceField: "distanceMeters",
            spherical: true,
            query: match,
            ...(filters.maxDistanceKm && { maxDistance: filters.maxDistanceKm * 1000 }),
          },
        },
      ];

      if (filters.sortBy === "rating") {
        pipeline.push({ $sort: { averageRating: -1 } });
      } else if (filters.sortBy === "price") {
        pipeline.push({ $sort: { "priceRange.min": 1 } });
      }
      // "closest" (default with geo) relies on $geoNear's inherent distance ordering.

      pipeline.push({
        $facet: {
          items: [{ $skip: skip }, { $limit: filters.limit }],
          totalCount: [{ $count: "count" }],
        },
      });

      const [result] = await RepairService.aggregate(pipeline).exec();
      const rawItems = (result?.items ?? []) as IRepairServiceDocument[];
      const items = await RepairService.populate(rawItems, [
        { path: "provider", select: PROVIDER_FIELDS },
        { path: "category", select: CATEGORY_FIELDS },
      ]);

      return {
        items,
        total: result?.totalCount?.[0]?.count ?? 0,
      };
    }

    const sort: Record<string, 1 | -1> =
      filters.sortBy === "price"
        ? { "priceRange.min": 1 }
        : { averageRating: -1 };

    const [items, total] = await Promise.all([
      RepairService.find(match)
        .populate("provider", PROVIDER_FIELDS)
        .populate("category", CATEGORY_FIELDS)
        .sort(sort)
        .skip(skip)
        .limit(filters.limit)
        .exec(),
      RepairService.countDocuments(match),
    ]);

    return { items, total };
  }
}
