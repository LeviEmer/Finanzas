export interface FinancialSnapshot {
  id: string;
  date: string;
  availableBalance: number;
  totalRemainingDebt: number;
  totalSpentByCategory: Record<string, number>;
  totalAntExpenses: number;
}
