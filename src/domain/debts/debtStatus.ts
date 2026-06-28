import type { Debt, Payment } from "@/shared/types";

const MAX_PERIODS_WITHOUT_PROGRESS = 3;
const MAX_MINIMUM_PAYMENT_RATIO = 0.4;

export interface AtRiskContext {
  debt: Debt;
  payments: Payment[];
  periodIncome: number;
  hasOverduePayment: boolean;
}

/**
 * Una deuda se marca "en peligro" si tiene un pago vencido, si su cuota
 * mínima supera un porcentaje alto del ingreso del periodo, o si lleva
 * varios periodos sin reducir saldo. Reglas definidas en la Fase 1.
 */
export function isDebtAtRisk(context: AtRiskContext): boolean {
  if (context.hasOverduePayment) return true;

  if (context.periodIncome > 0) {
    const ratio = context.debt.minimumPayment / context.periodIncome;
    if (ratio > MAX_MINIMUM_PAYMENT_RATIO) return true;
  }

  const recentPayments = context.payments.slice(-MAX_PERIODS_WITHOUT_PROGRESS);
  const hasNoProgress =
    recentPayments.length >= MAX_PERIODS_WITHOUT_PROGRESS &&
    recentPayments.every((p) => p.amount <= 0);

  return hasNoProgress;
}

export function recalculateBalanceAfterPayment(
  debt: Debt,
  paymentAmount: number
): number {
  return Math.max(0, debt.currentBalance - paymentAmount);
}
