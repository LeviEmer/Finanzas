import { debtRepository } from "@/data/repositories/debtRepository";
import { dashboardService } from "@/services/dashboardService";
import { sortDebtsByStrategy } from "@/domain/paymentStrategies";
import { simulateDebtPayoff, type SimulationResult } from "@/domain/projections/simulateDebtPayoff";
import type { Debt, PaymentStrategy } from "@/shared/types";

export interface PlanResult {
  orderedDebts: Debt[];
  monthlySurplus: number;
  simulation: SimulationResult;
}

export const planService = {
  async buildPlan(strategy: PaymentStrategy): Promise<PlanResult> {
    const [debts, summary] = await Promise.all([
      debtRepository.getAll(),
      dashboardService.getSummary(),
    ]);

    const activeDebts = debts.filter((d) => d.status !== "paid_off");
    const orderedDebts = sortDebtsByStrategy(activeDebts, strategy);
    const monthlySurplus = Math.max(0, summary.balance.availableBalance);

    const simulation = simulateDebtPayoff({
      debts: activeDebts,
      monthlySurplus,
      strategy,
    });

    return { orderedDebts, monthlySurplus, simulation };
  },
};
