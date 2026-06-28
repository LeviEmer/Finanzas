import { db } from "@/data/db";
import type { Reminder } from "@/shared/types";

export const reminderRepository = {
  async getAll(): Promise<Reminder[]> {
    return db.reminders.toArray();
  },

  async getPending(): Promise<Reminder[]> {
    return db.reminders.where("status").equals("pending").toArray();
  },

  async create(reminder: Reminder): Promise<string> {
    return db.reminders.add(reminder);
  },

  async update(id: string, changes: Partial<Reminder>): Promise<number> {
    return db.reminders.update(id, changes);
  },
};
