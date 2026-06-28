import type { Expense } from "@/shared/types";

export function totalExpensesByKind(
  expenses: Expense[],
  kind: Expense["kind"]
): number {
  return expenses
    .filter((expense) => expense.kind === kind)
    .reduce((sum, expense) => sum + expense.amount, 0);
}
