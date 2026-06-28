export type PaymentType = "partial" | "full" | "minimum";

export type PaymentSource = "salary" | "extra_income" | "savings";

export interface Payment {
  id: string;
  debtId: string;
  amount: number;
  type: PaymentType;
  date: string;
  remainingBalanceAfter: number;
  source: PaymentSource;
  notes?: string;
  createdAt: string;
}
