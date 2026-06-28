import { useEffect, useState } from "react";
import { debtService } from "@/services/debtService";
import { DebtCard } from "./DebtCard";
import { DebtFormModal } from "./DebtFormModal";
import { PaymentFormModal } from "./PaymentFormModal";
import { DebtHistoryModal } from "./DebtHistoryModal";
import { Button } from "@/ui/components/Button";
import type { Debt, Payment } from "@/shared/types";

type StatusFilter = "all" | Debt["status"];

export function DebtsPage() {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const [formOpen, setFormOpen] = useState(false);
  const [editingDebt, setEditingDebt] = useState<Debt | undefined>();

  const [paymentDebt, setPaymentDebt] = useState<Debt | null>(null);

  const [historyDebt, setHistoryDebt] = useState<Debt | null>(null);
  const [historyPayments, setHistoryPayments] = useState<Payment[]>([]);

  async function reload() {
    const data = await debtService.list();
    setDebts(data);
    setLoading(false);
  }

  useEffect(() => {
    reload();
  }, []);

  const filtered = debts.filter((debt) => {
    const matchesSearch = debt.name
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || debt.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  async function handleCreateOrUpdate(debt: Debt) {
    if (editingDebt) {
      await debtService.update(debt.id, debt);
    } else {
      await debtService.create(debt);
    }
    await reload();
  }

  async function handleDelete(debt: Debt) {
    const confirmed = window.confirm(
      `¿Eliminar la deuda "${debt.name}"? Esta acción no se puede deshacer.`
    );
    if (!confirmed) return;
    await debtService.remove(debt.id);
    await reload();
  }

  async function handleRegisterPayment(
    debt: Debt,
    payment: Omit<Payment, "id" | "remainingBalanceAfter" | "createdAt">
  ) {
    await debtService.recordPayment(debt, payment);
    await reload();
  }

  async function openHistory(debt: Debt) {
    const payments = await debtService.getHistory(debt.id);
    setHistoryPayments(payments);
    setHistoryDebt(debt);
  }

  return (
    <div className="pt-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Deudas</h1>
        <Button
          onClick={() => {
            setEditingDebt(undefined);
            setFormOpen(true);
          }}
        >
          Nueva deuda
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <input
          placeholder="Buscar por nombre..."
          value={search}
          maxLength={80}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm flex-1 min-w-[200px]"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
        >
          <option value="all">Todos los estados</option>
          <option value="active">Activas</option>
          <option value="at_risk">En peligro</option>
          <option value="paid_off">Pagadas</option>
        </select>
      </div>

      {loading ? (
        <p className="text-neutral-500">Cargando...</p>
      ) : filtered.length === 0 ? (
        <p className="text-neutral-500">
          No hay deudas registradas con estos filtros.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((debt) => (
            <DebtCard
              key={debt.id}
              debt={debt}
              onEdit={() => {
                setEditingDebt(debt);
                setFormOpen(true);
              }}
              onRegisterPayment={() => setPaymentDebt(debt)}
              onViewHistory={() => openHistory(debt)}
              onDelete={() => handleDelete(debt)}
            />
          ))}
        </div>
      )}

      <DebtFormModal
        open={formOpen}
        initial={editingDebt}
        onClose={() => setFormOpen(false)}
        onSubmit={handleCreateOrUpdate}
      />

      <PaymentFormModal
        open={paymentDebt !== null}
        debt={paymentDebt}
        onClose={() => setPaymentDebt(null)}
        onSubmit={handleRegisterPayment}
      />

      <DebtHistoryModal
        open={historyDebt !== null}
        debt={historyDebt}
        payments={historyPayments}
        onClose={() => setHistoryDebt(null)}
      />
    </div>
  );
}
