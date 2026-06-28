import { antExpenseRepository } from "@/data/repositories/antExpenseRepository";
import { calculateAntExpenseImpact } from "@/domain/antExpenses";
import type { AntExpense } from "@/shared/types";

export const antExpenseService = {
  async list(): Promise<AntExpense[]> {
    return antExpenseRepository.getAll();
  },

  async create(antExpense: AntExpense): Promise<string> {
    return antExpenseRepository.create(antExpense);
  },

  async remove(id: string): Promise<void> {
    await antExpenseRepository.remove(id);
  },

  async getImpact(periodIncome: number) {
    const antExpenses = await antExpenseRepository.getAll();
    return calculateAntExpenseImpact(antExpenses, periodIncome);
  },
};
