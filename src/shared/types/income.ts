export type IncomeKind = "fixed" | "extra";

export type IncomeFrequency = "monthly" | "biweekly" | "one_time";

export interface Income {
  id: string;
  kind: IncomeKind;
  amount: number;
  date: string;
  frequency: IncomeFrequency;
  source: string;
  categoryId?: string;
  createdAt: string;
  updatedAt: string;
}
