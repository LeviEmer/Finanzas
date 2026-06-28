import { useState } from "react";
import { Modal } from "@/ui/components/Modal";
import { FormField } from "@/ui/components/FormField";
import { Button } from "@/ui/components/Button";
import { useFormValidation } from "@/ui/hooks/useFormValidation";
import { debtSchema, type DebtFormValues } from "@/shared/validation/schemas";
import { debtTypeLabels } from "./debtLabels";
import type { Debt } from "@/shared/types";
import { generateId } from "@/shared/utils/id";

interface DebtFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (debt: Debt) => Promise<void>;
  initial?: Debt;
}

const emptyForm = {
  name: "",
  type: "credit_card" as Debt["type"],
  originalAmount: "",
  currentBalance: "",
  minimumPayment: "",
  interestRate: "",
  dueDay: "1",
  priority: "3",
  notes: "",
};

export function DebtFormModal({
  open,
  onClose,
  onSubmit,
  initial,
}: DebtFormModalProps) {
  const [form, setForm] = useState(
    initial
      ? {
          name: initial.name,
          type: initial.type,
          originalAmount: String(initial.originalAmount),
          currentBalance: String(initial.currentBalance),
          minimumPayment: String(initial.minimumPayment),
          interestRate: initial.interestRate ? String(initial.interestRate) : "",
          dueDay: String(initial.dueDay),
          priority: String(initial.priority),
          notes: initial.notes ?? "",
        }
      : emptyForm
  );
  const [submitting, setSubmitting] = useState(false);
  const { errors, validate } = useFormValidation(debtSchema);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const parsed: DebtFormValues | null = validate({
      name: form.name,
      type: form.type,
      originalAmount: Number(form.originalAmount),
      currentBalance: Number(form.currentBalance),
      minimumPayment: Number(form.minimumPayment),
      interestRate: form.interestRate ? Number(form.interestRate) : undefined,
      dueDay: Number(form.dueDay),
      priority: Number(form.priority) as DebtFormValues["priority"],
      notes: form.notes || undefined,
    });

    if (!parsed) return;

    setSubmitting(true);
    const now = new Date().toISOString();
    const debt: Debt = {
      id: initial?.id ?? generateId(),
      name: parsed.name,
      type: parsed.type,
      originalAmount: parsed.originalAmount,
      currentBalance: parsed.currentBalance,
      minimumPayment: parsed.minimumPayment,
      interestRate: parsed.interestRate,
      dueDay: parsed.dueDay,
      status: initial?.status ?? "active",
      priority: parsed.priority,
      notes: parsed.notes,
      createdAt: initial?.createdAt ?? now,
      updatedAt: now,
    };

    await onSubmit(debt);
    setSubmitting(false);
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? "Editar deuda" : "Nueva deuda"}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <FormField label="Nombre" error={errors.name}>
          <input
            className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
            value={form.name}
            maxLength={80}
            onChange={(e) => update("name", e.target.value)}
            autoComplete="off"
          />
        </FormField>

        <FormField label="Tipo" error={errors.type}>
          <select
            className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
            value={form.type}
            onChange={(e) => update("type", e.target.value)}
          >
            {Object.entries(debtTypeLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Monto original" error={errors.originalAmount}>
            <input
              type="number"
              min={0}
              step="0.01"
              inputMode="decimal"
              className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
              value={form.originalAmount}
              onChange={(e) => update("originalAmount", e.target.value)}
            />
          </FormField>

          <FormField label="Saldo actual" error={errors.currentBalance}>
            <input
              type="number"
              min={0}
              step="0.01"
              inputMode="decimal"
              className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
              value={form.currentBalance}
              onChange={(e) => update("currentBalance", e.target.value)}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Cuota mínima" error={errors.minimumPayment}>
            <input
              type="number"
              min={0}
              step="0.01"
              inputMode="decimal"
              className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
              value={form.minimumPayment}
              onChange={(e) => update("minimumPayment", e.target.value)}
            />
          </FormField>

          <FormField label="Tasa de interés % (opcional)" error={errors.interestRate}>
            <input
              type="number"
              min={0}
              max={100}
              step="0.01"
              inputMode="decimal"
              className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
              value={form.interestRate}
              onChange={(e) => update("interestRate", e.target.value)}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Día de pago" error={errors.dueDay}>
            <input
              type="number"
              min={1}
              max={31}
              className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
              value={form.dueDay}
              onChange={(e) => update("dueDay", e.target.value)}
            />
          </FormField>

          <FormField label="Prioridad (1 = más urgente)" error={errors.priority}>
            <select
              className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
              value={form.priority}
              onChange={(e) => update("priority", e.target.value)}
            >
              {[1, 2, 3, 4, 5].map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </FormField>
        </div>

        <FormField label="Notas (opcional)" error={errors.notes}>
          <textarea
            className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
            value={form.notes}
            maxLength={500}
            rows={2}
            onChange={(e) => update("notes", e.target.value)}
          />
        </FormField>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={submitting}>
            {initial ? "Guardar cambios" : "Crear deuda"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
