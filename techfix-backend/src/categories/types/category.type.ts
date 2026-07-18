import { CategoryTypeType } from "../../config/constants";

export interface ICategory {
  _id: string;
  name: string;
  slug: string;
  type: CategoryTypeType;
  description?: string;
  icon?: string;
  parent?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
