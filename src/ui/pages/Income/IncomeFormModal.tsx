import { useState } from "react";
import { Modal } from "@/ui/components/Modal";
import { FormField } from "@/ui/components/FormField";
import { Button } from "@/ui/components/Button";
import { useFormValidation } from "@/ui/hooks/useFormValidation";
import { incomeSchema, type IncomeFormValues } from "@/shared/validation/schemas";
import { incomeFrequencyLabels, incomeKindLabels } from "./incomeLabels";
import type { Income } from "@/shared/types";
import { generateId } from "@/shared/utils/id";

interface IncomeFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (income: Income) => Promise<void>;
}

export function IncomeFormModal({
  open,
  onClose,
  onSubmit,
}: IncomeFormModalProps) {
  const [kind, setKind] = useState<Income["kind"]>("fixed");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [frequency, setFrequency] = useState<Income["frequency"]>("monthly");
  const [source, setSource] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { errors, validate } = useFormValidation(incomeSchema);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const parsed: IncomeFormValues | null = validate({
      kind,
      amount: Number(amount),
      date,
      frequency,
      source,
    });

    if (!parsed) return;

    setSubmitting(true);
    const now = new Date().toISOString();
    const income: Income = {
      id: generateId(),
      kind: parsed.kind,
      amount: parsed.amount,
      date: parsed.date,
      frequency: parsed.frequency,
      source: parsed.source,
      createdAt: now,
      updatedAt: now,
    };

    await onSubmit(income);
    setSubmitting(false);
    setAmount("");
    setSource("");
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="Nuevo ingreso">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <FormField label="Tipo" error={errors.kind}>
          <select
            className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
            value={kind}
            onChange={(e) => setKind(e.target.value as Income["kind"])}
          >
            {Object.entries(incomeKindLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Monto" error={errors.amount}>
          <input
            type="number"
            min={0}
            step="0.01"
            inputMode="decimal"
            className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </FormField>

        <FormField label="Fecha" error={errors.date}>
          <input
            type="date"
            className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </FormField>

        <FormField label="Frecuencia" error={errors.frequency}>
          <select
            className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
            value={frequency}
            onChange={(e) =>
              setFrequency(e.target.value as Income["frequency"])
            }
          >
            {Object.entries(incomeFrequencyLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Fuente / descripción" error={errors.source}>
          <input
            className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
            value={source}
            maxLength={80}
            onChange={(e) => setSource(e.target.value)}
          />
        </FormField>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={submitting}>
            Guardar ingreso
          </Button>
        </div>
      </form>
    </Modal>
  );
}
