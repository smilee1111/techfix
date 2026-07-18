import { CategoryRepository } from "../repositories/category.repository";
import { CreateCategoryDto, UpdateCategoryDto, ListCategoriesDto } from "../dtos/category.dto";
import { ConflictError } from "../../errors/ConflictError";
import { NotFoundError } from "../../errors/NotFoundError";

/**
 * Category Service
 * Business rules for browsable product/repair categories.
 */
export class CategoryService {
  private categoryRepository: CategoryRepository;

  constructor() {
    this.categoryRepository = new CategoryRepository();
  }

  async list(query: ListCategoriesDto) {
    const filter: { type?: ListCategoriesDto["type"]; isActive: boolean } = {
      isActive: true,
    };
    if (query.type) filter.type = query.type;

    const categories = await this.categoryRepository.findAll(filter);
    return { categories };
  }

  async getBySlug(slug: string) {
    const category = await this.categoryRepository.findBySlug(slug);
    if (!category) {
      throw new NotFoundError("Category");
    }
    return { category };
  }

  async create(dto: CreateCategoryDto) {
    const exists = await this.categoryRepository.nameExists(dto.name);
    if (exists) {
      throw new ConflictError("A category with this name already exists");
    }

    const category = await this.categoryRepository.create(dto);
    return { category };
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const category = await this.categoryRepository.updateById(id, dto);
    if (!category) {
      throw new NotFoundError("Category");
    }
    return { category };
  }

  async remove(id: string) {
    const category = await this.categoryRepository.deleteById(id);
    if (!category) {
      throw new NotFoundError("Category");
    }
    return { message: "Category deleted successfully" };
  }
}
