import { db } from "@/data/db";
import type { Debt } from "@/shared/types";

export const debtRepository = {
  async getAll(): Promise<Debt[]> {
    return db.debts.toArray();
  },

  async getById(id: string): Promise<Debt | undefined> {
    return db.debts.get(id);
  },

  async create(debt: Debt): Promise<string> {
    return db.debts.add(debt);
  },

  async update(id: string, changes: Partial<Debt>): Promise<number> {
    return db.debts.update(id, changes);
  },

  async remove(id: string): Promise<void> {
    return db.debts.delete(id);
  },

  async getByStatus(status: Debt["status"]): Promise<Debt[]> {
    return db.debts.where("status").equals(status).toArray();
  },
};
