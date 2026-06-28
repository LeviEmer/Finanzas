import { db } from "@/data/db";
import type { Payment } from "@/shared/types";

export const paymentRepository = {
  async getAll(): Promise<Payment[]> {
    return db.payments.toArray();
  },

  async getByDebtId(debtId: string): Promise<Payment[]> {
    return db.payments.where("debtId").equals(debtId).sortBy("date");
  },

  async create(payment: Payment): Promise<string> {
    return db.payments.add(payment);
  },

  async remove(id: string): Promise<void> {
    return db.payments.delete(id);
  },
};
