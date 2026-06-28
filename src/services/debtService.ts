import { debtRepository } from "@/data/repositories/debtRepository";
import { paymentRepository } from "@/data/repositories/paymentRepository";
import { recalculateBalanceAfterPayment } from "@/domain/debts/debtStatus";
import type { Debt, Payment } from "@/shared/types";

export const debtService = {
  async list(): Promise<Debt[]> {
    return debtRepository.getAll();
  },

  async create(debt: Debt): Promise<string> {
    return debtRepository.create(debt);
  },

  async update(id: string, changes: Partial<Debt>): Promise<void> {
    await debtRepository.update(id, changes);
  },

  async remove(id: string): Promise<void> {
    await debtRepository.remove(id);
  },

  async getHistory(debtId: string): Promise<Payment[]> {
    return paymentRepository.getByDebtId(debtId);
  },

  async recordPayment(
    debt: Debt,
    payment: Omit<Payment, "id" | "remainingBalanceAfter" | "createdAt">
  ): Promise<void> {
    const remainingBalanceAfter = recalculateBalanceAfterPayment(
      debt,
      payment.amount
    );

    const fullPayment: Payment = {
      ...payment,
      id: crypto.randomUUID(),
      remainingBalanceAfter,
      createdAt: new Date().toISOString(),
    };

    await paymentRepository.create(fullPayment);

    await debtRepository.update(debt.id, {
      currentBalance: remainingBalanceAfter,
      status: remainingBalanceAfter === 0 ? "paid_off" : debt.status,
      updatedAt: new Date().toISOString(),
    });
  },
};
