import { categoryRepository } from "@/data/repositories/categoryRepository";
import {
  defaultAntExpenseCategories,
  defaultExpenseCategories,
} from "@/shared/constants/categories";
import { generateId } from "@/shared/utils/id";
import type { Category } from "@/shared/types";

export const categoryService = {
  async list(): Promise<Category[]> {
    return categoryRepository.getAll();
  },

  async getByKind(kind: Category["kind"]): Promise<Category[]> {
    return categoryRepository.getByKind(kind);
  },

  async ensureDefaults(): Promise<void> {
    const existing = await categoryRepository.getAll();
    if (existing.length > 0) return;

    const now = new Date().toISOString();
    const seedCategories = [
      ...defaultExpenseCategories,
      ...defaultAntExpenseCategories,
    ];

    for (const category of seedCategories) {
      await categoryRepository.create({
        ...category,
        id: generateId(),
        createdAt: now,
        updatedAt: now,
      });
    }
  },
};
