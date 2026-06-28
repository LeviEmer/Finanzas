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

    return debts
      .filter((debt) => debt.status !== "paid_off")
      .map((debt) => {
        const info = calculateDueDateInfo(debt, referenceDate);
        return { debt, ...info };
      })
      .sort((a, b) => a.daysUntilDue - b.daysUntilDue);
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
};
