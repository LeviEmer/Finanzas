import {
  addMonths,
  differenceInCalendarDays,
  getDaysInMonth,
  setDate,
  startOfDay,
} from "date-fns";
import type { Debt, ReminderAlertType } from "@/shared/types";

export interface DueDateInfo {
  dueDate: Date;
  daysUntilDue: number;
  alertType: ReminderAlertType | "upcoming";
}

/**
 * Calcula la próxima ocurrencia de pago de una deuda recurrente a partir de
 * su día de pago configurado. Si el día ya pasó este mes, se asume que esa
 * ocurrencia está vencida (atrasada) hasta que se registre un pago — no se
 * "salta" automáticamente al mes siguiente, para no esconder un atraso real.
 */
export function calculateDueDateInfo(
  debt: Debt,
  referenceDate: Date = new Date()
): DueDateInfo {
  const today = startOfDay(referenceDate);
  const daysInCurrentMonth = getDaysInMonth(today);
  const clampedDay = Math.min(debt.dueDay, daysInCurrentMonth);
  const dueDate = setDate(today, clampedDay);

  const daysUntilDue = differenceInCalendarDays(dueDate, today);

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

  return { dueDate, daysUntilDue, alertType };
}

export function calculateNextDueDateAfterPaid(
  debt: Debt,
  referenceDate: Date = new Date()
): Date {
  const nextMonth = addMonths(startOfDay(referenceDate), 1);
  const daysInNextMonth = getDaysInMonth(nextMonth);
  const clampedDay = Math.min(debt.dueDay, daysInNextMonth);
  return setDate(nextMonth, clampedDay);
}
