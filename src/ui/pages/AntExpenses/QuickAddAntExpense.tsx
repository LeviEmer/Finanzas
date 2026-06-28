import { useState } from "react";
import { Button } from "@/ui/components/Button";
import { useFormValidation } from "@/ui/hooks/useFormValidation";
import {
  antExpenseSchema,
  type AntExpenseFormValues,
} from "@/shared/validation/schemas";
import type { AntExpense, Category } from "@/shared/types";
import { generateId } from "@/shared/utils/id";

interface QuickAddAntExpenseProps {
  categories: Category[];
  onSubmit: (antExpense: AntExpense) => Promise<void>;
}

export function QuickAddAntExpense({
  categories,
  onSubmit,
}: QuickAddAntExpenseProps) {
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { errors, validate, clearErrors } = useFormValidation(
    antExpenseSchema
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const parsed: AntExpenseFormValues | null = validate({
      categoryId,
      amount: Number(amount),
      date: new Date().toISOString().slice(0, 10),
      description,
    });

    if (!parsed) return;

    setSubmitting(true);
    const antExpense: AntExpense = {
      id: generateId(),
      categoryId: parsed.categoryId,
      amount: parsed.amount,
      date: parsed.date,
      description: parsed.description ?? "",
      createdAt: new Date().toISOString(),
    };

    await onSubmit(antExpense);
    setSubmitting(false);
    setAmount("");
    setDescription("");
    clearErrors();
  }

  if (categories.length === 0) {
    return (
      <p className="text-sm text-neutral-500">
        Aún no hay categorías de gasto hormiga configuradas.
      </p>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-5 flex flex-col gap-3"
    >
      <p className="text-sm font-medium">Registrar gasto hormiga</p>

      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => setCategoryId(category.id)}
            className={`rounded-full px-3 py-1.5 text-sm border transition-colors ${
              categoryId === category.id
                ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 border-transparent"
                : "border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300"
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>
      {errors.categoryId && (
        <span className="text-xs text-red-600">{errors.categoryId}</span>
      )}

      <div className="flex gap-2">
        <input
          type="number"
          min={0}
          step="0.01"
          inputMode="decimal"
          placeholder="Monto"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm flex-1"
        />
        <input
          placeholder="Descripción (opcional)"
          value={description}
          maxLength={120}
          onChange={(e) => setDescription(e.target.value)}
          className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm flex-1"
        />
      </div>
      {errors.amount && (
        <span className="text-xs text-red-600">{errors.amount}</span>
      )}

      <Button type="submit" disabled={submitting}>
        Registrar
      </Button>
    </form>
  );
}
