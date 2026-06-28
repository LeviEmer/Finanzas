export type ReminderStatus = "pending" | "sent" | "dismissed";

export type ReminderAlertType = "due_today" | "due_this_week" | "overdue";

export interface Reminder {
  id: string;
  debtId: string;
  targetDate: string;
  leadDays: number;
  status: ReminderStatus;
  alertType: ReminderAlertType;
  createdAt: string;
}
