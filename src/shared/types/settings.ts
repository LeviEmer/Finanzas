export type SalaryType = "monthly" | "biweekly";

export interface Settings {
  id: string;
  currency: string;
  salaryType: SalaryType;
  payDays: number[];
  savingsGoalPercentage: number;
  antExpenseThresholdPercentage: number;
  minimumCushion: number;
  reminderLeadDays: number;
  darkMode: boolean;
  updatedAt: string;
}
