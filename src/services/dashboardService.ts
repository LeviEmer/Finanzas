import { antExpenseRepository } from "@/data/repositories/antExpenseRepository";
import { debtRepository } from "@/data/repositories/debtRepository";
import { expenseRepository } from "@/data/repositories/expenseRepository";
import { incomeRepository } from "@/data/repositories/incomeRepository";
import { settingsRepository } from "@/data/repositories/settingsRepository";
import {
  calculateAvailableBalance,
  type AvailableBalanceResult,
} from "@/domain/availableBalance/calculateAvailableBalance";

export interface DashboardSummary {
  balance: AvailableBalanceResult;
  activeDebtsCount: number;
  totalRemainingDebt: number;
  totalOriginalDebt: number;
}

export const dashboardService = {
  async getSummary(): Promise<DashboardSummary> {
    const [debts, incomes, expenses, antExpenses, settings] =
      await Promise.all([
        debtRepository.getAll(),
        incomeRepository.getAll(),
        expenseRepository.getAll(),
        antExpenseRepository.getAll(),
        settingsRepository.get(),
      ]);

    const fixedExpenses = expenses.filter((e) => e.kind === "fixed");
    const variableExpenses = expenses.filter((e) => e.kind === "variable");
    const activeDebts = debts.filter((d) => d.status !== "paid_off");

    const balance = calculateAvailableBalance({
      incomes,
      fixedExpenses,
      variableExpenses,
      debts,
      antExpenses,
      savingsGoalPercentage: settings?.savingsGoalPercentage ?? 0,
    });

    return {
      balance,
      activeDebtsCount: activeDebts.length,
      totalRemainingDebt: activeDebts.reduce(
        (sum, d) => sum + d.currentBalance,
        0
      ),
      totalOriginalDebt: activeDebts.reduce(
        (sum, d) => sum + d.originalAmount,
        0
      ),
    };
  },
};
