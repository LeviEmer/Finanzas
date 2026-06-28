import { create } from "zustand";
import { generateSalt, hashPin, verifyPin } from "@/shared/security/pinCrypto";
import { getWaitSecondsForAttempts } from "@/shared/security/lockoutPolicy";

const STORAGE_KEY = "finance-app-lock";

interface StoredLock {
  saltHex: string;
  hash: string;
  failedAttempts: number;
  lockedUntil: number | null;
}

interface AppLockState {
  configured: boolean;
  unlocked: boolean;
  failedAttempts: number;
  lockedUntilMs: number | null;
  error: string | null;
  setupPin: (pin: string) => Promise<void>;
  unlock: (pin: string) => Promise<boolean>;
  lockNow: () => void;
  resetPin: (currentPin: string, newPin: string) => Promise<boolean>;
  removePin: (currentPin: string) => Promise<boolean>;
}

function readStored(): StoredLock | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredLock;
  } catch {
    return null;
  }
}

function writeStored(value: StoredLock) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
}

export const useAppLockStore = create<AppLockState>((set, get) => {
  const stored = readStored();

  return {
    configured: stored !== null,
    unlocked: stored === null,
    failedAttempts: stored?.failedAttempts ?? 0,
    lockedUntilMs: stored?.lockedUntil ?? null,
    error: null,

    async setupPin(pin: string) {
      const saltHex = generateSalt();
      const hash = await hashPin(pin, saltHex);
      const record: StoredLock = {
        saltHex,
        hash,
        failedAttempts: 0,
        lockedUntil: null,
      };
      writeStored(record);
      set({ configured: true, unlocked: true, failedAttempts: 0, error: null });
    },

    async unlock(pin: string) {
      const record = readStored();
      if (!record) {
        set({ unlocked: true });
        return true;
      }

      if (record.lockedUntil && Date.now() < record.lockedUntil) {
        const remaining = Math.ceil((record.lockedUntil - Date.now()) / 1000);
        set({ error: `Espera ${remaining}s antes de intentar de nuevo` });
        return false;
      }

      const valid = await verifyPin(pin, record.saltHex, record.hash);

      if (valid) {
        const updated: StoredLock = {
          ...record,
          failedAttempts: 0,
          lockedUntil: null,
        };
        writeStored(updated);
        set({ unlocked: true, failedAttempts: 0, lockedUntilMs: null, error: null });
        return true;
      }

      const failedAttempts = record.failedAttempts + 1;
      const waitSeconds = getWaitSecondsForAttempts(failedAttempts);
      const lockedUntil = waitSeconds > 0 ? Date.now() + waitSeconds * 1000 : null;

      writeStored({ ...record, failedAttempts, lockedUntil });
      set({
        failedAttempts,
        lockedUntilMs: lockedUntil,
        error: "PIN incorrecto",
      });
      return false;
    },

    lockNow() {
      if (!get().configured) return;
      set({ unlocked: false });
    },

    async resetPin(currentPin: string, newPin: string) {
      const record = readStored();
      if (!record) return false;
      const valid = await verifyPin(currentPin, record.saltHex, record.hash);
      if (!valid) {
        set({ error: "PIN actual incorrecto" });
        return false;
      }
      await get().setupPin(newPin);
      return true;
    },

    async removePin(currentPin: string) {
      const record = readStored();
      if (!record) return true;
      const valid = await verifyPin(currentPin, record.saltHex, record.hash);
      if (!valid) {
        set({ error: "PIN actual incorrecto" });
        return false;
      }
      localStorage.removeItem(STORAGE_KEY);
      set({ configured: false, unlocked: true, failedAttempts: 0, lockedUntilMs: null });
      return true;
    },
  };
});
