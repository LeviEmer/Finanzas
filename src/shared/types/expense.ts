export type ExpenseKind = "fixed" | "variable";

export interface Expense {
  id: string;
  categoryId: string;
  kind: ExpenseKind;
  amount: number;
  date: string;
  recurring: boolean;
  description: string;
  createdAt: string;
  updatedAt: string;
}
