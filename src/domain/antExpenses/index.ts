import type { AntExpense } from "@/shared/types";

export interface AntExpenseImpact {
  total: number;
  byCategory: Record<string, number>;
  percentageOfIncome: number;
}

/**
 * Agrupa los gastos hormiga por categoría y mide su impacto respecto al
 * ingreso del periodo, para alimentar el umbral de alerta de la Fase 1.
 */
export function calculateAntExpenseImpact(
  antExpenses: AntExpense[],
  periodIncome: number
): AntExpenseImpact {
  const byCategory: Record<string, number> = {};

  for (const expense of antExpenses) {
    byCategory[expense.categoryId] =
      (byCategory[expense.categoryId] ?? 0) + expense.amount;
  }

  const total = antExpenses.reduce((sum, e) => sum + e.amount, 0);
  const percentageOfIncome =
    periodIncome > 0 ? (total / periodIncome) * 100 : 0;

  return { total, byCategory, percentageOfIncome };
}
