import { useState } from "react";
import { Modal } from "@/ui/components/Modal";
import { FormField } from "@/ui/components/FormField";
import { Button } from "@/ui/components/Button";
import { useFormValidation } from "@/ui/hooks/useFormValidation";
import { dueDaySchema } from "@/shared/validation/schemas";
import type { Debt } from "@/shared/types";

interface AssignDueDayModalProps {
  open: boolean;
  debt: Debt | null;
  onClose: () => void;
  onAssign: (debtId: string, dueDay: number) => Promise<void>;
}

export function AssignDueDayModal({
  open,
  debt,
  onClose,
  onAssign,
}: AssignDueDayModalProps) {
  const [dueDay, setDueDay] = useState("1");
  const [submitting, setSubmitting] = useState(false);
  const { errors, validate } = useFormValidation(dueDaySchema);

  if (!debt) return null;
  const currentDebt = debt;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = validate(Number(dueDay));
    if (parsed === null) return;

    setSubmitting(true);
    await onAssign(currentDebt.id, parsed);
    setSubmitting(false);
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title={`Fecha de pago — ${debt.name}`}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <FormField label="Día del mes en que se vence (1-31)" error={errors._root}>
          <input
            type="number"
            min={1}
            max={31}
            className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
            value={dueDay}
            onChange={(e) => setDueDay(e.target.value)}
          />
        </FormField>
        <p className="text-xs text-neutral-500">
          Este pago se repetirá automáticamente cada mes en este día.
        </p>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={submitting}>
            Asignar fecha
          </Button>
        </div>
      </form>
    </Modal>
  );
}
