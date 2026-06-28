import type { AntExpense, Debt, Expense, Income } from "@/shared/types";

export interface AvailableBalanceInput {
  incomes: Income[];
  fixedExpenses: Expense[];
  variableExpenses: Expense[];
  debts: Debt[];
  antExpenses: AntExpense[];
  savingsGoalPercentage: number;
}

export interface AvailableBalanceResult {
  totalIncome: number;
  totalFixedExpenses: number;
  totalMinimumDebtPayments: number;
  totalVariableExpenses: number;
  totalAntExpenses: number;
  savingsReserve: number;
  availableBalance: number;
}

/**
 * Disponible = Ingresos - gastos fijos - cuotas mínimas de deuda
 *            - gastos variables - gastos hormiga - reserva de ahorro
 * Refleja la regla central definida en la Fase 1 de negocio.
 */
export function calculateAvailableBalance(
  input: AvailableBalanceInput
): AvailableBalanceResult {
  const totalIncome = sum(input.incomes.map((i) => i.amount));
  const totalFixedExpenses = sum(input.fixedExpenses.map((e) => e.amount));
  const totalVariableExpenses = sum(
    input.variableExpenses.map((e) => e.amount)
  );
  const totalMinimumDebtPayments = sum(
    input.debts
      .filter((d) => d.status !== "paid_off")
      .map((d) => d.minimumPayment)
  );
  const totalAntExpenses = sum(input.antExpenses.map((a) => a.amount));

  const savingsReserve =
    totalIncome * (input.savingsGoalPercentage / 100);

  const availableBalance =
    totalIncome -
    totalFixedExpenses -
    totalMinimumDebtPayments -
    totalVariableExpenses -
    totalAntExpenses -
    savingsReserve;

  return {
    totalIncome,
    totalFixedExpenses,
    totalMinimumDebtPayments,
    totalVariableExpenses,
    totalAntExpenses,
    savingsReserve,
    availableBalance,
  };
}

function sum(values: number[]): number {
  return values.reduce((acc, value) => acc + value, 0);
}
