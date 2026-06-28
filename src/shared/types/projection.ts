export type ProjectionScenarioType = "real" | "simulated";

export type PaymentStrategy =
  | "minimum_plus_surplus"
  | "snowball"
  | "avalanche"
  | "custom";

export interface ProjectionParametersSnapshot {
  totalDebt: number;
  totalMonthlyIncome: number;
  totalFixedExpenses: number;
  strategy: PaymentStrategy;
}

export interface ProjectionResult {
  debtFreeDate: string;
  monthsToDebtFree: number;
  interestSaved?: number;
}

export interface Projection {
  id: string;
  generatedAt: string;
  scenarioType: ProjectionScenarioType;
  parameters: ProjectionParametersSnapshot;
  result: ProjectionResult;
}
