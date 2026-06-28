import {
  endOfMonth,
  isWithinInterval,
  setDate,
  startOfMonth,
} from "date-fns";
import { debtRepository } from "@/data/repositories/debtRepository";
import { incomeRepository } from "@/data/repositories/incomeRepository";
import { expenseRepository } from "@/data/repositories/expenseRepository";
import { antExpenseRepository } from "@/data/repositories/antExpenseRepository";
import { categoryRepository } from "@/data/repositories/categoryRepository";
import { calculateAntExpenseImpact } from "@/domain/antExpenses";

export type ReportPeriod = "monthly" | "biweekly_first" | "biweekly_second";

export interface CategoryBreakdownItem {
  categoryId: string;
  categoryName: string;
  amount: number;
}

export interface ReportSummary {
  periodLabel: string;
  totalIncome: number;
  totalExpenses: number;
  totalAntExpenses: number;
  cashFlow: number;
  expensesByCategory: CategoryBreakdownItem[];
  antExpensePercentageOfIncome: number;
  debtProgress: {
    totalOriginal: number;
    totalRemaining: number;
    percentagePaid: number;
  };
}

function getPeriodRange(period: ReportPeriod, referenceDate: Date) {
  if (period === "monthly") {
    return { start: startOfMonth(referenceDate), end: endOfMonth(referenceDate) };
  }
  if (period === "biweekly_first") {
    return { start: setDate(referenceDate, 1), end: setDate(referenceDate, 15) };
  }
  return { start: setDate(referenceDate, 16), end: endOfMonth(referenceDate) };
}

export const reportService = {
  async getSummary(
    period: ReportPeriod,
    referenceDate: Date = new Date()
  ): Promise<ReportSummary> {
    const { start, end } = getPeriodRange(period, referenceDate);
    const interval = { start, end };

    const [incomes, expenses, antExpenses, categories, debts] =
      await Promise.all([
        incomeRepository.getAll(),
        expenseRepository.getAll(),
        antExpenseRepository.getAll(),
        categoryRepository.getAll(),
        debtRepository.getAll(),
      ]);

    const inRange = (dateStr: string) =>
      isWithinInterval(new Date(dateStr), interval);

    const periodIncomes = incomes.filter((i) => inRange(i.date));
    const periodExpenses = expenses.filter((e) => inRange(e.date));
    const periodAntExpenses = antExpenses.filter((a) => inRange(a.date));

    const totalIncome = periodIncomes.reduce((sum, i) => sum + i.amount, 0);
    const totalExpenses = periodExpenses.reduce((sum, e) => sum + e.amount, 0);
    const totalAntExpenses = periodAntExpenses.reduce(
      (sum, a) => sum + a.amount,
      0
    );

    const categoryNameById = new Map(categories.map((c) => [c.id, c.name]));
    const byCategory = new Map<string, number>();
    for (const expense of periodExpenses) {
      byCategory.set(
        expense.categoryId,
        (byCategory.get(expense.categoryId) ?? 0) + expense.amount
      );
    }

    const expensesByCategory: CategoryBreakdownItem[] = Array.from(
      byCategory.entries()
    ).map(([categoryId, amount]) => ({
      categoryId,
      categoryName: categoryNameById.get(categoryId) ?? "Sin categoría",
      amount,
    }));

    const antImpact = calculateAntExpenseImpact(periodAntExpenses, totalIncome);

    const activeDebts = debts.filter((d) => d.status !== "paid_off" || d.currentBalance === 0);
    const totalOriginal = activeDebts.reduce((sum, d) => sum + d.originalAmount, 0);
    const totalRemaining = activeDebts.reduce((sum, d) => sum + d.currentBalance, 0);
    const percentagePaid =
      totalOriginal > 0
        ? ((totalOriginal - totalRemaining) / totalOriginal) * 100
        : 0;

    return {
      periodLabel: periodLabelFor(period),
      totalIncome,
      totalExpenses,
      totalAntExpenses,
      cashFlow: totalIncome - totalExpenses - totalAntExpenses,
      expensesByCategory,
      antExpensePercentageOfIncome: antImpact.percentageOfIncome,
      debtProgress: { totalOriginal, totalRemaining, percentagePaid },
    };
  },
};

function periodLabelFor(period: ReportPeriod): string {
  if (period === "monthly") return "Mes completo";
  if (period === "biweekly_first") return "Primera quincena (1-15)";
  return "Segunda quincena (16-fin de mes)";
}
