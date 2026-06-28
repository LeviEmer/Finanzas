import {
  addMonths,
  differenceInCalendarDays,
  endOfMonth,
  getDaysInMonth,
  isWithinInterval,
  setDate,
  startOfDay,
  startOfMonth,
} from "date-fns";
import type { Debt, Payment, ReminderAlertType } from "@/shared/types";

export interface DueDateInfo {
  dueDate: Date;
  daysUntilDue: number;
  alertType: ReminderAlertType | "upcoming";
}

const MAX_CYCLE_LOOKAHEAD = 24;

function clampToMonth(reference: Date, dueDay: number): Date {
  const daysInMonth = getDaysInMonth(reference);
  return setDate(reference, Math.min(dueDay, daysInMonth));
}

function wasPaidInCycle(payments: Payment[], cycleDate: Date): boolean {
  const interval = { start: startOfMonth(cycleDate), end: endOfMonth(cycleDate) };
  return payments.some((p) => isWithinInterval(new Date(p.date), interval));
}

/**
 * Calcula la próxima ocurrencia de pago de una deuda recurrente. Dos reglas
 * clave (ajustadas a partir de feedback real de uso):
 *
 * 1. El primer ciclo cuenta desde el momento en que se asignó el día de
 *    pago (dueDayAssignedAt), no desde "este mes" a secas — así, si el día
 *    elegido ya pasó este mes, no se marca como atrasado de inmediato; la
 *    primera ocurrencia real es la del mes siguiente.
 * 2. Si ya existe un pago registrado dentro del mes de un ciclo, ese ciclo
 *    se considera resuelto y se avanza al siguiente automáticamente — así
 *    pagar una deuda no la deja "atrasada" hasta el próximo mes.
 */
export function calculateDueDateInfo(
  debt: Debt,
  payments: Payment[],
  referenceDate: Date = new Date()
): DueDateInfo | null {
  if (!debt.dueDay) return null;

  const today = startOfDay(referenceDate);
  const anchor = startOfDay(
    new Date(debt.dueDayAssignedAt ?? debt.createdAt)
  );

  let candidate = clampToMonth(anchor, debt.dueDay);
  if (candidate < anchor) {
    candidate = clampToMonth(addMonths(anchor, 1), debt.dueDay);
  }

  for (let i = 0; i < MAX_CYCLE_LOOKAHEAD; i++) {
    const paid = wasPaidInCycle(payments, candidate);
    if (paid && candidate <= today) {
      candidate = clampToMonth(addMonths(candidate, 1), debt.dueDay);
      continue;
    }
    break;
  }

  const daysUntilDue = differenceInCalendarDays(candidate, today);

  let alertType: DueDateInfo["alertType"];
  if (daysUntilDue < 0) {
    alertType = "overdue";
  } else if (daysUntilDue === 0) {
    alertType = "due_today";
  } else if (daysUntilDue <= 7) {
    alertType = "due_this_week";
  } else {
    alertType = "upcoming";
  }

  return { dueDate: candidate, daysUntilDue, alertType };
}
