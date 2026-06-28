import { debtRepository } from "@/data/repositories/debtRepository";
import { calculateDueDateInfo } from "@/domain/calendar/dueDateCalculator";
import type { Debt, ReminderAlertType } from "@/shared/types";

export interface CalendarEntry {
  debt: Debt;
  dueDate: Date;
  daysUntilDue: number;
  alertType: ReminderAlertType | "upcoming";
}

export interface CalendarGroups {
  overdue: CalendarEntry[];
  dueToday: CalendarEntry[];
  dueThisWeek: CalendarEntry[];
  dueThisMonth: CalendarEntry[];
}

export const calendarService = {
  async getEntries(referenceDate: Date = new Date()): Promise<CalendarEntry[]> {
    const debts = await debtRepository.getAll();

    const entries: CalendarEntry[] = [];
    for (const debt of debts) {
      if (debt.status === "paid_off") continue;
      const info = calculateDueDateInfo(debt, referenceDate);
      if (!info) continue;
      entries.push({ debt, ...info });
    }

    return entries.sort((a, b) => a.daysUntilDue - b.daysUntilDue);
  },

  async getGroups(referenceDate: Date = new Date()): Promise<CalendarGroups> {
    const entries = await calendarService.getEntries(referenceDate);

    return {
      overdue: entries.filter((e) => e.alertType === "overdue"),
      dueToday: entries.filter((e) => e.alertType === "due_today"),
      dueThisWeek: entries.filter((e) => e.alertType === "due_this_week"),
      dueThisMonth: entries.filter((e) => e.alertType === "upcoming"),
    };
  },

  async getUnscheduledDebts(): Promise<Debt[]> {
    const debts = await debtRepository.getAll();
    return debts.filter(
      (debt) => debt.status !== "paid_off" && !debt.dueDay
    );
  },

  async assignDueDay(debtId: string, dueDay: number): Promise<void> {
    await debtRepository.update(debtId, {
      dueDay,
      updatedAt: new Date().toISOString(),
    });
  },
};
