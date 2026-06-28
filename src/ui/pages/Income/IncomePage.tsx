import { useEffect, useState } from "react";
import { incomeService } from "@/services/incomeService";
import { IncomeFormModal } from "./IncomeFormModal";
import { Button } from "@/ui/components/Button";
import { Badge } from "@/ui/components/Badge";
import { formatCurrency } from "@/shared/utils/formatCurrency";
import { incomeFrequencyLabels, incomeKindLabels } from "./incomeLabels";
import type { Income } from "@/shared/types";

export function IncomePage() {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);

  async function reload() {
    const data = await incomeService.list();
    setIncomes(
      data.sort((a, b) => (a.date < b.date ? 1 : -1))
    );
    setLoading(false);
  }

  useEffect(() => {
    reload();
  }, []);

  async function handleCreate(income: Income) {
    await incomeService.create(income);
    await reload();
  }

  async function handleDelete(income: Income) {
    const confirmed = window.confirm(
      `¿Eliminar el ingreso "${income.source}"?`
    );
    if (!confirmed) return;
    await incomeService.remove(income.id);
    await reload();
  }

  return (
    <div className="pt-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Ingresos</h1>
        <Button onClick={() => setFormOpen(true)}>Nuevo ingreso</Button>
      </div>

      {loading ? (
        <p className="text-neutral-500">Cargando...</p>
      ) : incomes.length === 0 ? (
        <p className="text-neutral-500">Aún no hay ingresos registrados.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {incomes.map((income) => (
            <div
              key={income.id}
              className="rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-4 flex items-center justify-between"
            >
              <div>
                <p className="font-medium">{income.source}</p>
                <p className="text-xs text-neutral-500">
                  {income.date} · {incomeFrequencyLabels[income.frequency]}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge tone={income.kind === "extra" ? "success" : "neutral"}>
                  {incomeKindLabels[income.kind]}
                </Badge>
                <span className="font-semibold">
                  {formatCurrency(income.amount)}
                </span>
                <Button variant="danger" onClick={() => handleDelete(income)}>
                  Eliminar
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <IncomeFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleCreate}
      />
    </div>
  );
}
