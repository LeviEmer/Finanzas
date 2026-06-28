import type { Debt, PaymentStrategy } from "@/shared/types";

/**
 * Ordena las deudas según la estrategia elegida. La lógica de distribución
 * de excedente sobre este orden se construye en la Fase 7 (módulo G),
 * cuando ya existan datos reales de flujo de caja para simular.
 */
export function sortDebtsByStrategy(
  debts: Debt[],
  strategy: PaymentStrategy
): Debt[] {
  const sorted = [...debts];

  switch (strategy) {
    case "snowball":
      return sorted.sort((a, b) => a.currentBalance - b.currentBalance);
    case "avalanche":
      return sorted.sort(
        (a, b) => (b.interestRate ?? 0) - (a.interestRate ?? 0)
      );
    case "custom":
      return sorted.sort((a, b) => a.priority - b.priority);
    case "minimum_plus_surplus":
    default:
      return sorted.sort((a, b) => a.priority - b.priority);
  }
}
