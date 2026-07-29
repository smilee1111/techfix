import { ProductRepository } from "../repositories/product.repository";
import {
  SearchProductsDto,
  CreateProductDto,
  UpdateProductDto,
} from "../dtos/product.dto";
import { NotFoundError } from "../../errors/NotFoundError";
import { ValidationError } from "../../errors/ValidationError";
import { ForbiddenError } from "../../errors/ForbiddenError";
import type { IProductDocument } from "../models/product.model";

/**
 * Product Service
 * Business rules for product discovery, detail, comparison and seller
 * management. Mirrors RepairService so both halves of the marketplace
 * behave the same way.
 */
export class ProductService {
  private productRepository: ProductRepository;

  constructor() {
    this.productRepository = new ProductRepository();
  }

  async search(dto: SearchProductsDto) {
    const { items, total } = await this.productRepository.search(dto);

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
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new NotFoundError("Product");
    }
    return { product };
  }

  async getMine(sellerId: string) {
    const items = await this.productRepository.findBySeller(sellerId);
    return { items };
  }

  async compare(ids: string[]) {
    const items = await this.productRepository.findByIds(ids);
    if (items.length === 0) {
      throw new NotFoundError("Products");
    }
    return { items };
  }

  async listBrands() {
    const brands = await this.productRepository.listBrands();
    return { brands: brands.filter(Boolean).sort() };
  }

  async create(sellerId: string, dto: CreateProductDto) {
    if (dto.originalPrice !== undefined && dto.originalPrice < dto.price) {
      throw new ValidationError("originalPrice cannot be lower than price");
    }

    const product = await this.productRepository.create({
      ...dto,
      seller: sellerId,
    } as unknown as Partial<IProductDocument>);

    return { product };
  }

  /** Loads a product and asserts the requester owns it. */
  private async findOwned(id: string, sellerId: string, isAdmin: boolean) {
    const product = await this.productRepository.findByIdIncludingInactive(id);
    if (!product) {
      throw new NotFoundError("Product");
    }
    if (!isAdmin && product.seller.toString() !== sellerId) {
      throw new ForbiddenError("You do not own this product");
    }
    return product;
  }

  async update(sellerId: string, isAdmin: boolean, id: string, dto: UpdateProductDto) {
    const existing = await this.findOwned(id, sellerId, isAdmin);

    // A partial update may move either price, so compare the merged pair.
    const price = dto.price ?? existing.price;
    const originalPrice = dto.originalPrice ?? existing.originalPrice;
    if (originalPrice !== undefined && originalPrice < price) {
      throw new ValidationError("originalPrice cannot be lower than price");
    }

    const product = await this.productRepository.updateById(
      id,
      dto as Partial<IProductDocument>
    );

    return { product };
  }

  /** Soft delete / restore, so past orders keep resolving their product ref. */
  async setActive(sellerId: string, isAdmin: boolean, id: string, isActive: boolean) {
    await this.findOwned(id, sellerId, isAdmin);
    const product = await this.productRepository.updateById(id, {
      isActive,
    } as Partial<IProductDocument>);
    return { product };
  }

  /**
   * Admin-only authenticity badge. Deliberately skips findOwned — a seller
   * must never be able to verify their own product.
   */
  async setVerified(id: string, isVerified: boolean) {
    const existing = await this.productRepository.findByIdIncludingInactive(id);
    if (!existing) {
      throw new NotFoundError("Product");
    }
    const product = await this.productRepository.updateById(id, {
      isVerified,
    } as Partial<IProductDocument>);
    return { product };
  }
}
