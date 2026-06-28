import { useEffect, useState } from "react";
import { expenseService } from "@/services/expenseService";
import { categoryService } from "@/services/categoryService";
import { ExpenseFormModal } from "./ExpenseFormModal";
import { Button } from "@/ui/components/Button";
import { Badge } from "@/ui/components/Badge";
import { formatCurrency } from "@/shared/utils/formatCurrency";
import type { Category, Expense } from "@/shared/types";

export function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);

  async function reload() {
    const [expenseData, categoryData] = await Promise.all([
      expenseService.list(),
      categoryService.list(),
    ]);
    setExpenses(expenseData.sort((a, b) => (a.date < b.date ? 1 : -1)));
    setCategories(categoryData.filter((c) => c.kind === "fixed" || c.kind === "variable"));
    setLoading(false);
  }

  useEffect(() => {
    reload();
  }, []);

  function categoryName(categoryId: string): string {
    return categories.find((c) => c.id === categoryId)?.name ?? "Sin categoría";
  }

  async function handleCreate(expense: Expense) {
    await expenseService.create(expense);
    await reload();
  }

  async function handleDelete(expense: Expense) {
    const confirmed = window.confirm(
      `¿Eliminar el gasto "${expense.description}"?`
    );
    if (!confirmed) return;
    await expenseService.remove(expense.id);
    await reload();
  }

  return (
    <div className="pt-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Gastos</h1>
        <Button
          onClick={() => setFormOpen(true)}
          disabled={categories.length === 0}
        >
          Nuevo gasto
        </Button>
      </div>

      {loading ? (
        <p className="text-neutral-500">Cargando...</p>
      ) : expenses.length === 0 ? (
        <p className="text-neutral-500">Aún no hay gastos registrados.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {expenses.map((expense) => (
            <div
              key={expense.id}
              className="rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-4 flex items-center justify-between"
            >
              <div>
                <p className="font-medium">{expense.description}</p>
                <p className="text-xs text-neutral-500">
                  {expense.date} · {categoryName(expense.categoryId)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge tone={expense.kind === "fixed" ? "neutral" : "warning"}>
                  {expense.kind === "fixed" ? "Fijo" : "Variable"}
                </Badge>
                <span className="font-semibold">
                  {formatCurrency(expense.amount)}
                </span>
                <Button variant="danger" onClick={() => handleDelete(expense)}>
                  Eliminar
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ExpenseFormModal
        open={formOpen}
        categories={categories}
        onClose={() => setFormOpen(false)}
        onSubmit={handleCreate}
      />
    </div>
  );
}
