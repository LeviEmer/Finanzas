import { useEffect, useRef, useState } from "react";
import { settingsService } from "@/services/settingsService";
import { backupService } from "@/services/backupService";
import { useAppLockStore } from "@/app/providers/appLockStore";
import { useThemeStore } from "@/app/providers/themeStore";
import { FormField } from "@/ui/components/FormField";
import { Button } from "@/ui/components/Button";
import { useFormValidation } from "@/ui/hooks/useFormValidation";
import {
  settingsSchema,
  type SettingsFormValues,
  pinSchema,
} from "@/shared/validation/schemas";
import type { Settings } from "@/shared/types";

export function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const { errors, validate } = useFormValidation(settingsSchema);
  const { darkMode, toggleDarkMode } = useThemeStore();

  useEffect(() => {
    settingsService.get().then((data) => {
      setSettings(data);
      setLoading(false);
    });
  }, []);

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!settings) return;

    const formData = new FormData(e.currentTarget);
    const payDaysRaw = String(formData.get("payDays") ?? "");

    const parsed: SettingsFormValues | null = validate({
      currency: String(formData.get("currency") ?? ""),
      salaryType: String(formData.get("salaryType") ?? "monthly"),
      payDays: payDaysRaw
        .split(",")
        .map((v) => Number(v.trim()))
        .filter((v) => !Number.isNaN(v)),
      savingsGoalPercentage: Number(formData.get("savingsGoalPercentage")),
      antExpenseThresholdPercentage: Number(
        formData.get("antExpenseThresholdPercentage")
      ),
      minimumCushion: Number(formData.get("minimumCushion")),
      reminderLeadDays: Number(formData.get("reminderLeadDays")),
    });

    if (!parsed) return;

    const updated: Settings = {
      ...settings,
      ...parsed,
      darkMode: settings.darkMode,
      updatedAt: new Date().toISOString(),
    };

    await settingsService.save(updated);
    setSettings(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (loading || !settings) {
    return <p className="pt-6 text-neutral-500">Cargando configuración...</p>;
  }

  return (
    <div className="pt-6 flex flex-col gap-6 max-w-2xl">
      <h1 className="text-xl font-semibold">Configuración</h1>

      <form
        onSubmit={handleSave}
        className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-5 flex flex-col gap-3"
      >
        <p className="text-sm font-medium">Preferencias generales</p>

        <FormField label="Moneda (código, ej. USD, MXN)" error={errors.currency}>
          <input
            name="currency"
            defaultValue={settings.currency}
            maxLength={8}
            className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
          />
        </FormField>

        <FormField label="Tipo de salario" error={errors.salaryType}>
          <select
            name="salaryType"
            defaultValue={settings.salaryType}
            className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
          >
            <option value="monthly">Mensual</option>
            <option value="biweekly">Quincenal</option>
          </select>
        </FormField>

        <FormField
          label="Días de pago (separados por coma, ej. 1, 15)"
          error={errors.payDays}
        >
          <input
            name="payDays"
            defaultValue={settings.payDays.join(", ")}
            className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
          />
        </FormField>

        <p className="text-sm font-medium pt-2">Reglas financieras</p>

        <FormField
          label="% objetivo de ahorro"
          error={errors.savingsGoalPercentage}
        >
          <input
            type="number"
            name="savingsGoalPercentage"
            min={0}
            max={100}
            step="0.1"
            defaultValue={settings.savingsGoalPercentage}
            className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
          />
        </FormField>

        <FormField
          label="% umbral de alerta de gasto hormiga"
          error={errors.antExpenseThresholdPercentage}
        >
          <input
            type="number"
            name="antExpenseThresholdPercentage"
            min={0}
            max={100}
            step="0.1"
            defaultValue={settings.antExpenseThresholdPercentage}
            className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
          />
        </FormField>

        <FormField label="Colchón mínimo" error={errors.minimumCushion}>
          <input
            type="number"
            name="minimumCushion"
            min={0}
            step="0.01"
            defaultValue={settings.minimumCushion}
            className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
          />
        </FormField>

        <FormField
          label="Días de anticipación para recordatorios"
          error={errors.reminderLeadDays}
        >
          <input
            type="number"
            name="reminderLeadDays"
            min={0}
            max={30}
            defaultValue={settings.reminderLeadDays}
            className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
          />
        </FormField>

        <div className="flex items-center gap-3 pt-2">
          <Button type="submit">Guardar configuración</Button>
          {saved && (
            <span className="text-sm text-green-600">Guardado ✓</span>
          )}
        </div>
      </form>

      <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-5 flex items-center justify-between">
        <p className="text-sm font-medium">Modo oscuro</p>
        <Button variant="secondary" onClick={toggleDarkMode}>
          {darkMode ? "Desactivar" : "Activar"}
        </Button>
      </div>

      <SecuritySection />
      <BackupSection />
    </div>
  );
}

function SecuritySection() {
  const { resetPin, removePin, error } = useAppLockStore();
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  async function handleChangePin(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    const result = pinSchema.safeParse(newPin);
    if (!result.success) {
      setMessage(result.error.issues[0].message);
      return;
    }

    const ok = await resetPin(currentPin, newPin);
    if (ok) {
      setMessage("PIN actualizado correctamente");
      setCurrentPin("");
      setNewPin("");
    }
  }

  async function handleRemovePin() {
    const confirmed = window.confirm(
      "¿Quitar el PIN de acceso? Cualquiera con acceso a este dispositivo podrá abrir la app."
    );
    if (!confirmed) return;
    await removePin(currentPin);
    setCurrentPin("");
  }

  return (
    <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-5 flex flex-col gap-3">
      <p className="text-sm font-medium">Seguridad</p>
      <form onSubmit={handleChangePin} className="flex flex-col gap-3">
        <FormField label="PIN actual">
          <input
            type="password"
            inputMode="numeric"
            value={currentPin}
            maxLength={8}
            onChange={(e) => setCurrentPin(e.target.value)}
            className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
          />
        </FormField>
        <FormField label="Nuevo PIN">
          <input
            type="password"
            inputMode="numeric"
            value={newPin}
            maxLength={8}
            onChange={(e) => setNewPin(e.target.value)}
            className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
          />
        </FormField>
        {(message || error) && (
          <p className="text-xs text-neutral-500">{message ?? error}</p>
        )}
        <div className="flex gap-2">
          <Button type="submit">Cambiar PIN</Button>
          <Button type="button" variant="danger" onClick={handleRemovePin}>
            Quitar PIN
          </Button>
        </div>
      </form>
    </div>
  );
}

function BackupSection() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<string | null>(null);

  async function handleExport() {
    await backupService.exportAll();
    setStatus("Backup exportado correctamente.");
  }

  async function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const confirmed = window.confirm(
      "Importar un backup reemplazará TODOS los datos actuales de la app. ¿Continuar?"
    );
    if (!confirmed) {
      e.target.value = "";
      return;
    }

    try {
      const text = await file.text();
      const payload = backupService.parseBackupFile(text);
      await backupService.importAll(payload);
      setStatus("Backup importado correctamente. Recarga la app para ver los datos.");
    } catch (err) {
      setStatus(
        err instanceof Error ? err.message : "No se pudo importar el archivo."
      );
    } finally {
      e.target.value = "";
    }
  }

  return (
    <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-5 flex flex-col gap-3">
      <p className="text-sm font-medium">Backup y exportación</p>
      <p className="text-xs text-neutral-500">
        Tus datos viven solo en este dispositivo. Exporta un respaldo
        periódicamente para no perder tu historial financiero.
      </p>
      <div className="flex gap-2">
        <Button variant="secondary" onClick={handleExport}>
          Exportar backup (JSON)
        </Button>
        <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
          Importar backup
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={handleImportFile}
        />
      </div>
      {status && <p className="text-xs text-neutral-500">{status}</p>}
    </div>
  );
}
