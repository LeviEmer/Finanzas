import { settingsRepository } from "@/data/repositories/settingsRepository";
import type { Settings } from "@/shared/types";

const DEFAULT_SETTINGS: Settings = {
  id: "default",
  currency: "USD",
  salaryType: "monthly",
  payDays: [1],
  savingsGoalPercentage: 0,
  antExpenseThresholdPercentage: 10,
  minimumCushion: 0,
  reminderLeadDays: 3,
  darkMode: false,
  updatedAt: new Date().toISOString(),
};

export const settingsService = {
  async get(): Promise<Settings> {
    const settings = await settingsRepository.get();
    return settings ?? DEFAULT_SETTINGS;
  },

  async save(settings: Settings): Promise<void> {
    await settingsRepository.save(settings);
  },
};
