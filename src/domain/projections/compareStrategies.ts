import type { Debt, PaymentStrategy } from "@/shared/types";
import { simulateDebtPayoff, type SimulationResult } from "./simulateDebtPayoff";

export interface StrategyComparison {
  strategy: PaymentStrategy;
  result: SimulationResult;
}

const COMPARABLE_STRATEGIES: PaymentStrategy[] = [
  "snowball",
  "avalanche",
  "minimum_plus_surplus",
];

export function compareStrategies(
  debts: Debt[],
  monthlySurplus: number,
  referenceDate?: Date
): StrategyComparison[] {
  return COMPARABLE_STRATEGIES.map((strategy) => ({
    strategy,
    result: simulateDebtPayoff({ debts, monthlySurplus, strategy, referenceDate }),
  }));
}
