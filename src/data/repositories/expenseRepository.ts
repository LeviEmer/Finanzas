import { db } from "@/data/db";
import type { Expense } from "@/shared/types";

export const expenseRepository = {
  async getAll(): Promise<Expense[]> {
    return db.expenses.toArray();
  },

  async create(expense: Expense): Promise<string> {
    return db.expenses.add(expense);
  },

  async update(id: string, changes: Partial<Expense>): Promise<number> {
    return db.expenses.update(id, changes);
  },

  async remove(id: string): Promise<void> {
    return db.expenses.delete(id);
  },
};
