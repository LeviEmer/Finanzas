import { useState } from "react";
import { Modal } from "@/ui/components/Modal";
import { FormField } from "@/ui/components/FormField";
import { Button } from "@/ui/components/Button";
import { useFormValidation } from "@/ui/hooks/useFormValidation";
import { paymentSchema, type PaymentFormValues } from "@/shared/validation/schemas";
import { paymentSourceLabels, paymentTypeLabels } from "./debtLabels";
import type { Debt, Payment } from "@/shared/types";

interface PaymentFormModalProps {
  open: boolean;
  debt: Debt | null;
  onClose: () => void;
  onSubmit: (
    debt: Debt,
    payment: Omit<Payment, "id" | "remainingBalanceAfter" | "createdAt">
  ) => Promise<void>;
}

export function PaymentFormModal({
  open,
  debt,
  onClose,
  onSubmit,
}: PaymentFormModalProps) {
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<Payment["type"]>("partial");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [source, setSource] = useState<Payment["source"]>("salary");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [balanceError, setBalanceError] = useState<string | undefined>();
  const { errors, validate } = useFormValidation(paymentSchema);

  if (!debt) return null;
  const currentDebt = debt;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBalanceError(undefined);

    const parsed: PaymentFormValues | null = validate({
      amount: Number(amount),
      type,
      date,
      source,
      notes: notes || undefined,
    });

    if (!parsed) return;

    if (parsed.amount > currentDebt.currentBalance) {
      setBalanceError(
        `El monto no puede superar el saldo actual (${currentDebt.currentBalance})`
      );
      return;
    }

    setSubmitting(true);
    await onSubmit(currentDebt, { ...parsed, debtId: currentDebt.id });
    setSubmitting(false);
    setAmount("");
    setNotes("");
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title={`Registrar pago — ${debt.name}`}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <p className="text-xs text-neutral-500">
          Saldo actual: {debt.currentBalance}
        </p>

        <FormField label="Monto" error={errors.amount ?? balanceError}>
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

        <FormField label="Tipo de pago" error={errors.type}>
          <select
            className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
            value={type}
            onChange={(e) => setType(e.target.value as Payment["type"])}
          >
            {Object.entries(paymentTypeLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Fecha" error={errors.date}>
          <input
            type="date"
            className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </FormField>

        <FormField label="Origen del dinero" error={errors.source}>
          <select
            className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
            value={source}
            onChange={(e) => setSource(e.target.value as Payment["source"])}
          >
            {Object.entries(paymentSourceLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Notas (opcional)" error={errors.notes}>
          <input
            className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
            value={notes}
            maxLength={300}
            onChange={(e) => setNotes(e.target.value)}
          />
        </FormField>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={submitting}>
            Registrar pago
          </Button>
        </div>
      </form>
    </Modal>
  );
}
