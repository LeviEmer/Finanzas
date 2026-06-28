import { useState } from "react";
import { Modal } from "@/ui/components/Modal";
import { FormField } from "@/ui/components/FormField";
import { Button } from "@/ui/components/Button";
import { useFormValidation } from "@/ui/hooks/useFormValidation";
import { expenseSchema, type ExpenseFormValues } from "@/shared/validation/schemas";
import type { Category, Expense } from "@/shared/types";
import { generateId } from "@/shared/utils/id";

interface ExpenseFormModalProps {
  open: boolean;
  categories: Category[];
  onClose: () => void;
  onSubmit: (expense: Expense) => Promise<void>;
}

export function ExpenseFormModal({
  open,
  categories,
  onClose,
  onSubmit,
}: ExpenseFormModalProps) {
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [kind, setKind] = useState<Expense["kind"]>("fixed");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [recurring, setRecurring] = useState(false);
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { errors, validate } = useFormValidation(expenseSchema);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const parsed: ExpenseFormValues | null = validate({
      categoryId,
      kind,
      amount: Number(amount),
      date,
      recurring,
      description,
    });

    if (!parsed) return;

    setSubmitting(true);
    const now = new Date().toISOString();
    const expense: Expense = {
      id: generateId(),
      categoryId: parsed.categoryId,
      kind: parsed.kind,
      amount: parsed.amount,
      date: parsed.date,
      recurring: parsed.recurring,
      description: parsed.description,
      createdAt: now,
      updatedAt: now,
    };

    await onSubmit(expense);
    setSubmitting(false);
    setAmount("");
    setDescription("");
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="Nuevo gasto">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <FormField label="Categoría" error={errors.categoryId}>
          <select
            className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Tipo" error={errors.kind}>
          <select
            className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
            value={kind}
            onChange={(e) => setKind(e.target.value as Expense["kind"])}
          >
            <option value="fixed">Fijo</option>
            <option value="variable">Variable</option>
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

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={recurring}
            onChange={(e) => setRecurring(e.target.checked)}
          />
          Es un gasto recurrente
        </label>

        <FormField label="Descripción" error={errors.description}>
          <input
            className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
            value={description}
            maxLength={120}
            onChange={(e) => setDescription(e.target.value)}
          />
        </FormField>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={submitting}>
            Guardar gasto
          </Button>
        </div>
      </form>
    </Modal>
  );
}
