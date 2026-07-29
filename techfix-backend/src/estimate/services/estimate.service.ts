import { EstimateRepository } from "../repositories/estimate.repository";
import { CreateEstimateDto } from "../dtos/estimate.dto";
import { NotFoundError } from "../../errors/NotFoundError";
import type { IEstimateDocument } from "../models/estimate.model";

/**
 * Estimate Service
 * Computes an instant price-range estimate from existing repair listings
 * and persists it so the user can revisit/share the result.
 */
export class EstimateService {
  private estimateRepository: EstimateRepository;

  constructor() {
    this.estimateRepository = new EstimateRepository();
  }

  async create(userId: string | undefined, dto: CreateEstimateDto) {
    const deviceQuery = `${dto.brand} ${dto.deviceModel} ${dto.issueType}`.trim();
    const calc = await this.estimateRepository.calculatePriceRange(deviceQuery, dto.city);

    const estimate = await this.estimateRepository.create({
      ...(userId && { user: userId }),
      brand: dto.brand,
      deviceModel: dto.deviceModel,
      issueType: dto.issueType,
      city: dto.city,
      estimatedMin: calc.estimatedMin,
      estimatedMax: calc.estimatedMax,
      matchedShopsCount: calc.matchedShopsCount,
      topMatches: calc.topMatches,
    } as unknown as Partial<IEstimateDocument>);

    return { estimate };
  }

  async getById(id: string) {
    const estimate = await this.estimateRepository.findById(id);
    if (!estimate) {
      throw new NotFoundError("Estimate");
    }
    return { estimate };
  }
}
