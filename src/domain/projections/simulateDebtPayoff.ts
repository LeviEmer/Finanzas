import { addMonths } from "date-fns";
import type { Debt, PaymentStrategy } from "@/shared/types";
import { sortDebtsByStrategy } from "@/domain/paymentStrategies";

const MAX_MONTHS = 600;

interface SimDebt {
  id: string;
  name: string;
  balance: number;
  minimumPayment: number;
  monthlyRate: number;
  priority: number;
  interestRate: number;
}

export interface MonthSnapshot {
  month: number;
  totalRemaining: number;
}

export interface SimulationResult {
  monthsToPayoff: number;
  debtFreeDate: Date;
  totalInterestPaid: number;
  totalPaid: number;
  timeline: MonthSnapshot[];
  feasible: boolean;
}

export interface SimulationInput {
  debts: Debt[];
  monthlySurplus: number;
  strategy: PaymentStrategy;
  referenceDate?: Date;
}

/**
 * Simula mes a mes el pago de todas las deudas: primero se acumula el
 * interés del periodo, luego se aplican las cuotas mínimas de cada deuda,
 * y el excedente disponible se concentra en la deuda de mayor prioridad
 * según la estrategia elegida (en cascada si esa deuda se liquida ese
 * mismo mes). Esto refleja la regla de priorización de pagos de la Fase 1.
 */
export function simulateDebtPayoff(input: SimulationInput): SimulationResult {
  const referenceDate = input.referenceDate ?? new Date();
  const activeDebts = input.debts.filter((d) => d.status !== "paid_off");

  if (activeDebts.length === 0) {
    return {
      monthsToPayoff: 0,
      debtFreeDate: referenceDate,
      totalInterestPaid: 0,
      totalPaid: 0,
      timeline: [{ month: 0, totalRemaining: 0 }],
      feasible: true,
    };
  }

  let simDebts: SimDebt[] = activeDebts.map((d) => ({
    id: d.id,
    name: d.name,
    balance: d.currentBalance,
    minimumPayment: d.minimumPayment,
    monthlyRate: (d.interestRate ?? 0) / 100 / 12,
    priority: d.priority,
    interestRate: d.interestRate ?? 0,
  }));

  const timeline: MonthSnapshot[] = [
    { month: 0, totalRemaining: sumBalances(simDebts) },
  ];

  let totalInterestPaid = 0;
  let totalPaid = 0;
  let month = 0;
  let feasible = true;

  while (sumBalances(simDebts) > 0.01 && month < MAX_MONTHS) {
    month += 1;

    for (const debt of simDebts) {
      const interest = debt.balance * debt.monthlyRate;
      debt.balance += interest;
      totalInterestPaid += interest;
    }

    let surplus = input.monthlySurplus;

    for (const debt of simDebts) {
      const payment = Math.min(debt.minimumPayment, debt.balance);
      debt.balance -= payment;
      totalPaid += payment;
    }

    const orderedDebts = sortDebtsByStrategy(
      simDebts.map(toDebtLike),
      input.strategy
    );

    for (const ordered of orderedDebts) {
      if (surplus <= 0) break;
      const debt = simDebts.find((d) => d.id === ordered.id);
      if (!debt || debt.balance <= 0) continue;

      const extraPayment = Math.min(surplus, debt.balance);
      debt.balance -= extraPayment;
      surplus -= extraPayment;
      totalPaid += extraPayment;
    }

    simDebts = simDebts.filter((d) => d.balance > 0.01);

    timeline.push({ month, totalRemaining: sumBalances(simDebts) });

    if (month >= 2 && timeline[month].totalRemaining >= timeline[month - 1].totalRemaining) {
      const minimumsCoverInterest = simDebts.every(
        (d) => d.minimumPayment >= d.balance * d.monthlyRate
      );
      if (!minimumsCoverInterest && input.monthlySurplus <= 0) {
        feasible = false;
        break;
      }
    }
  }

  if (month >= MAX_MONTHS) feasible = false;

  return {
    monthsToPayoff: month,
    debtFreeDate: addMonths(referenceDate, month),
    totalInterestPaid,
    totalPaid,
    timeline,
    feasible,
  };
}

function sumBalances(debts: SimDebt[]): number {
  return debts.reduce((sum, d) => sum + d.balance, 0);
}

function toDebtLike(d: SimDebt): Debt {
  return {
    id: d.id,
    name: d.name,
    type: "other",
    originalAmount: d.balance,
    currentBalance: d.balance,
    minimumPayment: d.minimumPayment,
    interestRate: d.interestRate,
    dueDay: 1,
    status: "active",
    priority: d.priority as Debt["priority"],
    createdAt: "",
    updatedAt: "",
  };
}
