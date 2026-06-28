import { debtRepository } from "@/data/repositories/debtRepository";
import { dashboardService } from "@/services/dashboardService";
import { simulateDebtPayoff, type SimulationResult } from "@/domain/projections/simulateDebtPayoff";
import type { PaymentStrategy } from "@/shared/types";

export interface ScenarioInput {
  strategy: PaymentStrategy;
  extraIncome: number;
  expenseReduction: number;
}

export interface ScenarioComparison {
  baseline: SimulationResult;
  scenario: SimulationResult;
  baselineMonthlySurplus: number;
  scenarioMonthlySurplus: number;
}

export const projectionService = {
  async compareScenario(input: ScenarioInput): Promise<ScenarioComparison> {
    const [debts, summary] = await Promise.all([
      debtRepository.getAll(),
      dashboardService.getSummary(),
    ]);

    const activeDebts = debts.filter((d) => d.status !== "paid_off");
    const baselineMonthlySurplus = Math.max(
      0,
      summary.balance.availableBalance
    );
    const scenarioMonthlySurplus = Math.max(
      0,
      baselineMonthlySurplus + input.extraIncome + input.expenseReduction
    );

    const baseline = simulateDebtPayoff({
      debts: activeDebts,
      monthlySurplus: baselineMonthlySurplus,
      strategy: input.strategy,
    });

    const scenario = simulateDebtPayoff({
      debts: activeDebts,
      monthlySurplus: scenarioMonthlySurplus,
      strategy: input.strategy,
    });

    return {
      baseline,
      scenario,
      baselineMonthlySurplus,
      scenarioMonthlySurplus,
    };
  },
};
