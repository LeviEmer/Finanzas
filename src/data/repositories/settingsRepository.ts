import { db } from "@/data/db";
import type { Settings } from "@/shared/types";

const SETTINGS_ID = "default";

export const settingsRepository = {
  async get(): Promise<Settings | undefined> {
    return db.settings.get(SETTINGS_ID);
  },

  async save(settings: Settings): Promise<string> {
    return db.settings.put({ ...settings, id: SETTINGS_ID });
  },
};
