import Category, { ICategoryDocument } from "../models/category.model";
import { CategoryTypeType } from "../../config/constants";

/**
 * Category Repository
 * The only layer that talks to MongoDB for categories.
 */
export class CategoryRepository {
  async findAll(filter: {
    type?: CategoryTypeType;
    isActive?: boolean;
  }): Promise<ICategoryDocument[]> {
    return Category.find(filter).sort({ name: 1 }).exec();
  }

  async findById(id: string): Promise<ICategoryDocument | null> {
    return Category.findById(id).exec();
  }

  async findBySlug(slug: string): Promise<ICategoryDocument | null> {
    return Category.findOne({ slug }).exec();
  }

  async create(data: Record<string, unknown>): Promise<ICategoryDocument> {
    const category = new Category(data);
    return category.save();
  }

  async updateById(
    id: string,
    data: Record<string, unknown>
  ): Promise<ICategoryDocument | null> {
    return Category.findByIdAndUpdate(id, data, {
      returnDocument: "after",
      runValidators: true,
    }).exec();
  }

  async deleteById(id: string): Promise<ICategoryDocument | null> {
    return Category.findByIdAndDelete(id).exec();
  }

  async nameExists(name: string): Promise<boolean> {
    const count = await Category.countDocuments({ name });
    return count > 0;
  }
}
