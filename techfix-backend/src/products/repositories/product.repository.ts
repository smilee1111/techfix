import Product, { IProductDocument } from "../models/product.model";
import { ProductSearchFilters } from "../types/product.type";

const SELLER_FIELDS = "name avatar isVerifiedSeller";
const CATEGORY_FIELDS = "name slug";

/* eslint-disable @typescript-eslint/no-explicit-any */

/** Translates the query DTO into a Mongo filter. */
function buildFilter(filters: ProductSearchFilters): Record<string, any> {
  const filter: Record<string, any> = { isActive: true };

  if (filters.q) filter.$text = { $search: filters.q };
  if (filters.category) filter.category = filters.category;
  if (filters.brand) filter.brand = new RegExp(`^${filters.brand}$`, "i");
  if (filters.condition) filter.condition = filters.condition;
  if (filters.city) filter.city = new RegExp(`^${filters.city}$`, "i");
  if (filters.verifiedOnly) filter.isVerified = true;
  if (filters.inStockOnly) filter.stock = { $gt: 0 };
  if (filters.minRating !== undefined) filter.averageRating = { $gte: filters.minRating };

  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    filter.price = {};
    if (filters.minPrice !== undefined) filter.price.$gte = filters.minPrice;
    if (filters.maxPrice !== undefined) filter.price.$lte = filters.maxPrice;
  }

  return filter;
}

function buildSort(sortBy?: string): Record<string, 1 | -1> {
  if (sortBy === "price") return { price: 1 };
  if (sortBy === "rating") return { averageRating: -1 };
  return { createdAt: -1 };
}

/**
 * Product Repository
 * The only layer that talks to MongoDB for products.
 */
export class ProductRepository {
  async create(data: Partial<IProductDocument>): Promise<IProductDocument> {
    const product = new Product(data);
    return product.save();
  }

  async findById(id: string): Promise<IProductDocument | null> {
    return Product.findOne({ _id: id, isActive: true })
      .populate("seller", SELLER_FIELDS)
      .populate("category", CATEGORY_FIELDS)
      .exec();
  }

  /** Owner/admin-facing: ignores isActive so a hidden product can be restored. */
  async findByIdIncludingInactive(id: string): Promise<IProductDocument | null> {
    return Product.findById(id).populate("category", CATEGORY_FIELDS).exec();
  }

  async findByIds(ids: string[]): Promise<IProductDocument[]> {
    return Product.find({ _id: { $in: ids }, isActive: true })
      .populate("seller", SELLER_FIELDS)
      .populate("category", CATEGORY_FIELDS)
      .exec();
  }

  async findBySeller(sellerId: string): Promise<IProductDocument[]> {
    return Product.find({ seller: sellerId })
      .populate("category", CATEGORY_FIELDS)
      .sort({ createdAt: -1 })
      .exec();
  }

  async updateById(
    id: string,
    data: Partial<IProductDocument>
  ): Promise<IProductDocument | null> {
    return Product.findByIdAndUpdate(id, data, { returnDocument: "after" })
      .populate("seller", SELLER_FIELDS)
      .populate("category", CATEGORY_FIELDS)
      .exec();
  }

  async search(
    filters: ProductSearchFilters
  ): Promise<{ items: IProductDocument[]; total: number }> {
    const filter = buildFilter(filters);
    const skip = (filters.page - 1) * filters.limit;

    const [items, total] = await Promise.all([
      Product.find(filter)
        .populate("seller", SELLER_FIELDS)
        .populate("category", CATEGORY_FIELDS)
        .sort(buildSort(filters.sortBy))
        .skip(skip)
        .limit(filters.limit)
        .exec(),
      Product.countDocuments(filter),
    ]);

    return { items, total };
  }

  /** Distinct brands across active products — powers the brand filter chips. */
  async listBrands(): Promise<string[]> {
    return Product.distinct("brand", { isActive: true });
  }

  /**
   * Atomically decrements stock, refusing to go negative.
   *
   * The `stock: { $gte: quantity }` guard is part of the update filter, not
   * a separate read — so two orders racing for the last unit cannot both
   * succeed. Returns null when the guard rejects.
   */
  async decrementStock(id: string, quantity: number): Promise<IProductDocument | null> {
    return Product.findOneAndUpdate(
      { _id: id, stock: { $gte: quantity } },
      { $inc: { stock: -quantity } },
      { returnDocument: "after" }
    ).exec();
  }

  /** Keeps the denormalised rating snapshot in step with the reviews collection. */
  async setRatingSummary(
    id: string,
    averageRating: number,
    totalReviews: number
  ): Promise<void> {
    await Product.findByIdAndUpdate(id, { averageRating, totalReviews }).exec();
  }
}
