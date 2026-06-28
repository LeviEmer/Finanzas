import type { AvailableBalanceResult } from "@/domain/availableBalance/calculateAvailableBalance";
import { isMonthCritical } from "@/domain/alerts/alertRules";
import { sortDebtsByStrategy } from "@/domain/paymentStrategies";
import { compareStrategies } from "@/domain/projections/compareStrategies";
import { formatCurrency } from "@/shared/utils/formatCurrency";
import type { AntExpenseImpact } from "@/domain/antExpenses";
import type { CalendarEntry } from "@/services/calendarService";
import type { Debt, PaymentStrategy } from "@/shared/types";

export interface Recommendation {
  id: string;
  severity: "info" | "warning" | "critical";
  message: string;
}

export interface RecommendationContext {
  balance: AvailableBalanceResult;
  minimumCushion: number;
  debts: Debt[];
  strategy: PaymentStrategy;
  antExpenseImpact: AntExpenseImpact;
  antExpenseThresholdPercentage: number;
  overdueEntries: CalendarEntry[];
}

/**
 * Traduce las reglas de negocio de la Fase 1 en frases concretas. El orden
 * de evaluación importa: lo más urgente (mes crítico, atrasos) se muestra
 * antes que las sugerencias de optimización.
 */
export function generateRecommendations(
  context: RecommendationContext
): Recommendation[] {
  const recommendations: Recommendation[] = [];
  const activeDebts = context.debts.filter((d) => d.status !== "paid_off");

  if (context.overdueEntries.length > 0) {
    recommendations.push({
      id: "overdue",
      severity: "critical",
      message: `Tienes ${context.overdueEntries.length} pago(s) atrasado(s). Resuélvelos antes de cualquier otra cosa.`,
    });
  }

  const isCritical = isMonthCritical({
    availableBeforeVariableExpenses:
      context.balance.totalIncome -
      context.balance.totalFixedExpenses -
      context.balance.totalMinimumDebtPayments,
    minimumCushion: context.minimumCushion,
  });

  if (isCritical) {
    recommendations.push({
      id: "critical-month",
      severity: "critical",
      message:
        "Este mes estás muy justo: tus compromisos fijos casi agotan tu disponible antes de gastar en variables.",
    });
  }

  if (
    context.antExpenseImpact.percentageOfIncome >
    context.antExpenseThresholdPercentage
  ) {
    recommendations.push({
      id: "ant-expense-high",
      severity: "warning",
      message: `Tus gastos hormiga ya representan el ${context.antExpenseImpact.percentageOfIncome.toFixed(
        1
      )}% de tus ingresos. Reducirlos liberaría dinero real para tus deudas.`,
    });
  }

  if (activeDebts.length > 0) {
    const ordered = sortDebtsByStrategy(activeDebts, context.strategy);
    const topDebt = ordered[0];
    recommendations.push({
      id: "priority-debt",
      severity: "info",
      message: `Si concentras tu excedente en "${topDebt.name}" primero, reduces la presión general más rápido según tu estrategia actual.`,
    });
  }

  if (activeDebts.length > 1 && context.balance.availableBalance > 0) {
    const comparisons = compareStrategies(
      activeDebts,
      Math.max(0, context.balance.availableBalance)
    );
    const avalanche = comparisons.find((c) => c.strategy === "avalanche");
    const snowball = comparisons.find((c) => c.strategy === "snowball");

    if (avalanche && snowball && avalanche.result.feasible && snowball.result.feasible) {
      const interestDifference =
        snowball.result.totalInterestPaid - avalanche.result.totalInterestPaid;

      if (interestDifference > 1) {
        recommendations.push({
          id: "strategy-savings",
          severity: "info",
          message: `Usando el método avalancha en vez de bola de nieve, podrías ahorrar aproximadamente ${formatCurrency(
            interestDifference
          )} en intereses.`,
        });
      }
    }
  }

  if (recommendations.length === 0) {
    recommendations.push({
      id: "all-good",
      severity: "info",
      message: "Tu situación financiera este mes se ve estable. Sigue así.",
    });
  }

  return recommendations;
}
