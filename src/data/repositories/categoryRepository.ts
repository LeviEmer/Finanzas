import { db } from "@/data/db";
import type { Category } from "@/shared/types";

export const categoryRepository = {
  async getAll(): Promise<Category[]> {
    return db.categories.toArray();
  },

  async getByKind(kind: Category["kind"]): Promise<Category[]> {
    return db.categories.where("kind").equals(kind).toArray();
  },

  async create(category: Category): Promise<string> {
    return db.categories.add(category);
  },
};
