import { expenseRepository } from "@/data/repositories/expenseRepository";
import type { Expense } from "@/shared/types";

export const expenseService = {
  async list(): Promise<Expense[]> {
    return expenseRepository.getAll();
  },

  async create(expense: Expense): Promise<string> {
    return expenseRepository.create(expense);
  },

  async update(id: string, changes: Partial<Expense>): Promise<void> {
    await expenseRepository.update(id, changes);
  },

  async remove(id: string): Promise<void> {
    await expenseRepository.remove(id);
  },
};
