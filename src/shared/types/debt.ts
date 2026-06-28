export type DebtType =
  | "credit_card"
  | "personal_loan"
  | "mortgage"
  | "auto_loan"
  | "personal"
  | "other";

export type DebtStatus = "active" | "paid_off" | "at_risk";

export type DebtPriority = 1 | 2 | 3 | 4 | 5;

export interface Debt {
  id: string;
  name: string;
  type: DebtType;
  originalAmount: number;
  currentBalance: number;
  minimumPayment: number;
  interestRate?: number;
  dueDay?: number;
  status: DebtStatus;
  priority: DebtPriority;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
