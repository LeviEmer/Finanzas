const STORAGE_KEY = "finance-app-due-prompt-dismissed";

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function readDismissed(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

export function isDismissedToday(debtId: string): boolean {
  const dismissed = readDismissed();
  return dismissed[debtId] === todayKey();
}

export function markDismissedToday(debtId: string): void {
  const dismissed = readDismissed();
  dismissed[debtId] = todayKey();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(dismissed));
}
