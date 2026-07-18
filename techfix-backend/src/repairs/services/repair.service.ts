import { RepairRepository } from "../repositories/repair.repository";
import { SearchRepairsDto, CreateRepairServiceDto } from "../dtos/repair.dto";
import { NotFoundError } from "../../errors/NotFoundError";
import { ValidationError } from "../../errors/ValidationError";
import type { IRepairServiceDocument } from "../models/repairService.model";

/**
 * Repair Service
 * Business rules for repair-service discovery, detail and comparison.
 */
export class RepairService {
  private repairRepository: RepairRepository;

  constructor() {
    this.repairRepository = new RepairRepository();
  }

  async search(dto: SearchRepairsDto) {
    const { items, total } = await this.repairRepository.search(dto);

    return {
      items,
      pagination: {
        currentPage: dto.page,
        totalPages: Math.max(1, Math.ceil(total / dto.limit)),
        totalItems: total,
        itemsPerPage: dto.limit,
        hasNext: dto.page * dto.limit < total,
        hasPrev: dto.page > 1,
      },
    };
  }

  async getById(id: string) {
    const repairService = await this.repairRepository.findById(id);
    if (!repairService) {
      throw new NotFoundError("Repair service");
    }
    return { repairService };
  }

  async compare(ids: string[]) {
    const items = await this.repairRepository.findByIds(ids);
    if (items.length === 0) {
      throw new NotFoundError("Repair services");
    }
    return { items };
  }

  async create(providerId: string, dto: CreateRepairServiceDto) {
    if (dto.priceRange.min > dto.priceRange.max) {
      throw new ValidationError("priceRange.min cannot exceed priceRange.max");
    }

    const location = {
      address: dto.location.address,
      city: dto.location.city,
      ...(dto.location.coordinates && {
        coordinates: {
          type: "Point" as const,
          coordinates: [dto.location.coordinates.lng, dto.location.coordinates.lat] as [
            number,
            number
          ],
        },
      }),
    };

    const repairService = await this.repairRepository.create({
      ...dto,
      provider: providerId,
      location,
    } as unknown as Partial<IRepairServiceDocument>);

    return { repairService };
  }
}
