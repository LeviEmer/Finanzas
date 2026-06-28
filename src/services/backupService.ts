import { db } from "@/data/db";
import { downloadTextFile } from "@/shared/utils/downloadFile";

const BACKUP_VERSION = 1;
const LAST_EXPORT_KEY = "finance-app-last-export-at";
const LAST_IMPORT_KEY = "finance-app-last-import-at";

interface BackupPayload {
  version: number;
  exportedAt: string;
  data: {
    categories: unknown[];
    debts: unknown[];
    payments: unknown[];
    incomes: unknown[];
    expenses: unknown[];
    antExpenses: unknown[];
    reminders: unknown[];
    settings: unknown[];
    projections: unknown[];
    financialSnapshots: unknown[];
  };
}

const EXPECTED_KEYS: (keyof BackupPayload["data"])[] = [
  "categories",
  "debts",
  "payments",
  "incomes",
  "expenses",
  "antExpenses",
  "reminders",
  "settings",
  "projections",
  "financialSnapshots",
];

export const backupService = {
  async exportAll(): Promise<void> {
    const data: BackupPayload["data"] = {
      categories: await db.categories.toArray(),
      debts: await db.debts.toArray(),
      payments: await db.payments.toArray(),
      incomes: await db.incomes.toArray(),
      expenses: await db.expenses.toArray(),
      antExpenses: await db.antExpenses.toArray(),
      reminders: await db.reminders.toArray(),
      settings: await db.settings.toArray(),
      projections: await db.projections.toArray(),
      financialSnapshots: await db.financialSnapshots.toArray(),
    };

    const payload: BackupPayload = {
      version: BACKUP_VERSION,
      exportedAt: new Date().toISOString(),
      data,
    };

    downloadTextFile(
      JSON.stringify(payload, null, 2),
      "mis-finanzas-backup.json",
      "application/json"
    );

    localStorage.setItem(LAST_EXPORT_KEY, payload.exportedAt);
  },

  /**
   * Nombre de archivo fijo (sin fecha) a propósito: así, al guardarlo
   * siempre en la misma carpeta de iCloud Drive, el archivo se sobrescribe
   * en vez de acumular copias con fecha distinta en cada dispositivo.
   */
  getLastExportedAt(): string | null {
    return localStorage.getItem(LAST_EXPORT_KEY);
  },

  getLastImportedAt(): string | null {
    return localStorage.getItem(LAST_IMPORT_KEY);
  },

  /**
   * Valida la forma del archivo antes de tocar la base de datos: rechaza
   * cualquier estructura inesperada en vez de intentar "adivinar" el
   * contenido (defensa contra archivos corruptos o manipulados).
   */
  parseBackupFile(rawText: string): BackupPayload {
    let parsed: unknown;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      throw new Error("El archivo no es un JSON válido.");
    }

    if (
      typeof parsed !== "object" ||
      parsed === null ||
      !("data" in parsed) ||
      typeof (parsed as { data: unknown }).data !== "object"
    ) {
      throw new Error("El archivo no tiene el formato de backup esperado.");
    }

    const data = (parsed as BackupPayload).data;
    for (const key of EXPECTED_KEYS) {
      if (!Array.isArray(data[key])) {
        throw new Error(`Falta o es inválida la sección "${key}" del backup.`);
      }
    }

    return parsed as BackupPayload;
  },

  async importAll(payload: BackupPayload): Promise<void> {
    await db.transaction(
      "rw",
      [
        db.categories,
        db.debts,
        db.payments,
        db.incomes,
        db.expenses,
        db.antExpenses,
        db.reminders,
        db.settings,
        db.projections,
        db.financialSnapshots,
      ],
      async () => {
        await Promise.all([
          db.categories.clear(),
          db.debts.clear(),
          db.payments.clear(),
          db.incomes.clear(),
          db.expenses.clear(),
          db.antExpenses.clear(),
          db.reminders.clear(),
          db.settings.clear(),
          db.projections.clear(),
          db.financialSnapshots.clear(),
        ]);

        await Promise.all([
          db.categories.bulkAdd(payload.data.categories as never[]),
          db.debts.bulkAdd(payload.data.debts as never[]),
          db.payments.bulkAdd(payload.data.payments as never[]),
          db.incomes.bulkAdd(payload.data.incomes as never[]),
          db.expenses.bulkAdd(payload.data.expenses as never[]),
          db.antExpenses.bulkAdd(payload.data.antExpenses as never[]),
          db.reminders.bulkAdd(payload.data.reminders as never[]),
          db.settings.bulkAdd(payload.data.settings as never[]),
          db.projections.bulkAdd(payload.data.projections as never[]),
          db.financialSnapshots.bulkAdd(
            payload.data.financialSnapshots as never[]
          ),
        ]);
      }
    );

    localStorage.setItem(LAST_IMPORT_KEY, new Date().toISOString());
  },
};
