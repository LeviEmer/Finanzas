import type { Income } from "@/shared/types";

export function totalIncomeInRange(
  incomes: Income[],
  startDate: string,
  endDate: string
): number {
  return incomes
    .filter((income) => income.date >= startDate && income.date <= endDate)
    .reduce((sum, income) => sum + income.amount, 0);
}
