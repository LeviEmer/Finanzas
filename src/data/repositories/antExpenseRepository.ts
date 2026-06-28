import { db } from "@/data/db";
import type { AntExpense } from "@/shared/types";

export const antExpenseRepository = {
  async getAll(): Promise<AntExpense[]> {
    return db.antExpenses.toArray();
  },

  async create(antExpense: AntExpense): Promise<string> {
    return db.antExpenses.add(antExpense);
  },

  async remove(id: string): Promise<void> {
    return db.antExpenses.delete(id);
  },
};
