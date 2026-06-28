export type AlertSeverity = "info" | "warning" | "critical";

export interface FinancialAlert {
  id: string;
  severity: AlertSeverity;
  message: string;
}

export interface CriticalMonthContext {
  availableBeforeVariableExpenses: number;
  minimumCushion: number;
}

/**
 * Un mes se marca como crítico si el disponible proyectado antes de gastos
 * variables ya es menor al colchón mínimo configurado. Regla de la Fase 1.
 */
export function isMonthCritical(context: CriticalMonthContext): boolean {
  return context.availableBeforeVariableExpenses < context.minimumCushion;
}

export interface OverspendingRiskContext {
  spentSoFar: number;
  availableForPeriod: number;
  daysElapsed: number;
  totalDaysInPeriod: number;
}

/**
 * Compara el ritmo de gasto real contra el ritmo "saludable" (disponible
 * dividido entre los días restantes del periodo).
 */
export function isOverspendingRisk(context: OverspendingRiskContext): boolean {
  if (context.daysElapsed <= 0) return false;
  const healthyDailyRate =
    context.availableForPeriod / context.totalDaysInPeriod;
  const actualDailyRate = context.spentSoFar / context.daysElapsed;
  return actualDailyRate > healthyDailyRate;
}
