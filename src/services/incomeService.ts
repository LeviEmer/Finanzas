import { incomeRepository } from "@/data/repositories/incomeRepository";
import type { Income } from "@/shared/types";

export const incomeService = {
  async list(): Promise<Income[]> {
    return incomeRepository.getAll();
  },

  async create(income: Income): Promise<string> {
    return incomeRepository.create(income);
  },

  async update(id: string, changes: Partial<Income>): Promise<void> {
    await incomeRepository.update(id, changes);
  },

  async remove(id: string): Promise<void> {
    await incomeRepository.remove(id);
  },
};
