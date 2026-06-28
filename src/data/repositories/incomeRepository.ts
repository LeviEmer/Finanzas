import { db } from "@/data/db";
import type { Income } from "@/shared/types";

export const incomeRepository = {
  async getAll(): Promise<Income[]> {
    return db.incomes.toArray();
  },

  async create(income: Income): Promise<string> {
    return db.incomes.add(income);
  },

  async update(id: string, changes: Partial<Income>): Promise<number> {
    return db.incomes.update(id, changes);
  },

  async remove(id: string): Promise<void> {
    return db.incomes.delete(id);
  },
};
