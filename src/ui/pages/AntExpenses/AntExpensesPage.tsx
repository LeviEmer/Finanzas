import { useEffect, useState } from "react";
import { antExpenseService } from "@/services/antExpenseService";
import { categoryService } from "@/services/categoryService";
import { incomeService } from "@/services/incomeService";
import { QuickAddAntExpense } from "./QuickAddAntExpense";
import { Button } from "@/ui/components/Button";
import { formatCurrency } from "@/shared/utils/formatCurrency";
import type { AntExpense, Category } from "@/shared/types";
import type { AntExpenseImpact } from "@/domain/antExpenses";

export function AntExpensesPage() {
  const [antExpenses, setAntExpenses] = useState<AntExpense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [impact, setImpact] = useState<AntExpenseImpact | null>(null);
  const [loading, setLoading] = useState(true);

  async function reload() {
    const [entries, categoryData, incomes] = await Promise.all([
      antExpenseService.list(),
      categoryService.getByKind("ant"),
      incomeService.list(),
    ]);

    const periodIncome = incomes.reduce((sum, i) => sum + i.amount, 0);
    const impactData = await antExpenseService.getImpact(periodIncome);

    setAntExpenses(entries.sort((a, b) => (a.date < b.date ? 1 : -1)));
    setCategories(categoryData);
    setImpact(impactData);
    setLoading(false);
  }

  useEffect(() => {
    reload();
  }, []);

  function categoryName(categoryId: string): string {
    return categories.find((c) => c.id === categoryId)?.name ?? "Otros";
  }

  async function handleCreate(antExpense: AntExpense) {
    await antExpenseService.create(antExpense);
    await reload();
  }

  async function handleDelete(antExpense: AntExpense) {
    const confirmed = window.confirm("¿Eliminar este gasto hormiga?");
    if (!confirmed) return;
    await antExpenseService.remove(antExpense.id);
    await reload();
  }

  return (
    <div className="pt-6 flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Gastos hormiga</h1>

      <QuickAddAntExpense categories={categories} onSubmit={handleCreate} />

      {impact && (
        <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-5">
          <p className="text-sm text-neutral-500 mb-1">
            Total acumulado de gasto hormiga
          </p>
          <p className="text-2xl font-bold">{formatCurrency(impact.total)}</p>
          {impact.percentageOfIncome > 0 && (
            <p className="text-xs text-neutral-500 mt-1">
              Equivale al {impact.percentageOfIncome.toFixed(1)}% de tus
              ingresos registrados
            </p>
          )}
        </div>
      )}

      {loading ? (
        <p className="text-neutral-500">Cargando...</p>
      ) : antExpenses.length === 0 ? (
        <p className="text-neutral-500">
          Aún no hay gastos hormiga registrados.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {antExpenses.map((entry) => (
            <div
              key={entry.id}
              className="rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-3 flex items-center justify-between"
            >
              <div>
                <p className="text-sm font-medium">
                  {categoryName(entry.categoryId)}
                </p>
                <p className="text-xs text-neutral-500">
                  {entry.date}
                  {entry.description ? ` · ${entry.description}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold">
                  {formatCurrency(entry.amount)}
                </span>
                <Button variant="danger" onClick={() => handleDelete(entry)}>
                  Eliminar
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
