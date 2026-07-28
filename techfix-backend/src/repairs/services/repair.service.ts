import { RepairRepository } from "../repositories/repair.repository";
import {
  SearchRepairsDto,
  CreateRepairServiceDto,
  UpdateRepairServiceDto,
} from "../dtos/repair.dto";
import { NotFoundError } from "../../errors/NotFoundError";
import { ValidationError } from "../../errors/ValidationError";
import { ForbiddenError } from "../../errors/ForbiddenError";
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

  async getMine(providerId: string) {
    const items = await this.repairRepository.findByProvider(providerId);
    return { items };
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

  /**
   * Loads a listing and asserts the requester owns it. Ownership is read
   * from the stored document, never trusted from the request — the same
   * rule the booking module applies before a stage change.
   */
  private async findOwned(id: string, providerId: string, isAdmin: boolean) {
    const repairService = await this.repairRepository.findByIdIncludingInactive(id);
    if (!repairService) {
      throw new NotFoundError("Repair service");
    }
    if (!isAdmin && repairService.provider.toString() !== providerId) {
      throw new ForbiddenError("You do not own this listing");
    }
    return repairService;
  }

  async update(
    providerId: string,
    isAdmin: boolean,
    id: string,
    dto: UpdateRepairServiceDto
  ) {
    const existing = await this.findOwned(id, providerId, isAdmin);

    // A partial update can supply either bound, so validate the merged
    // range rather than only what arrived in the body.
    if (dto.priceRange) {
      const min = dto.priceRange.min ?? existing.priceRange.min;
      const max = dto.priceRange.max ?? existing.priceRange.max;
      if (min > max) {
        throw new ValidationError("priceRange.min cannot exceed priceRange.max");
      }
    }

    const { location, ...rest } = dto;
    const update: Record<string, unknown> = { ...rest };

    if (location) {
      update.location = {
        address: location.address,
        city: location.city ?? existing.location.city,
        ...(location.coordinates && {
          coordinates: {
            type: "Point" as const,
            coordinates: [location.coordinates.lng, location.coordinates.lat] as [
              number,
              number
            ],
          },
        }),
      };
    }

    const repairService = await this.repairRepository.updateById(
      id,
      update as Partial<IRepairServiceDocument>
    );

    return { repairService };
  }

  /** Soft delete / restore — bookings referencing this listing stay resolvable. */
  async setActive(providerId: string, isAdmin: boolean, id: string, isActive: boolean) {
    await this.findOwned(id, providerId, isAdmin);

    const repairService = await this.repairRepository.updateById(id, {
      isActive,
    } as Partial<IRepairServiceDocument>);

    return { repairService };
  }
}
