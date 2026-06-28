import { Badge } from "@/ui/components/Badge";
import { Button } from "@/ui/components/Button";
import { formatCurrency } from "@/shared/utils/formatCurrency";
import { debtStatusLabels, debtTypeLabels } from "./debtLabels";
import type { Debt } from "@/shared/types";

interface DebtCardProps {
  debt: Debt;
  onEdit: () => void;
  onRegisterPayment: () => void;
  onViewHistory: () => void;
  onDelete: () => void;
}

const statusTone = {
  active: "neutral",
  paid_off: "success",
  at_risk: "danger",
} as const;

export function DebtCard({
  debt,
  onEdit,
  onRegisterPayment,
  onViewHistory,
  onDelete,
}: DebtCardProps) {
  const progress =
    debt.originalAmount > 0
      ? Math.min(
          100,
          Math.round(
            ((debt.originalAmount - debt.currentBalance) /
              debt.originalAmount) *
              100
          )
        )
      : 0;

  return (
    <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-semibold">{debt.name}</p>
          <p className="text-xs text-neutral-500">{debtTypeLabels[debt.type]}</p>
        </div>
        <Badge tone={statusTone[debt.status]}>
          {debtStatusLabels[debt.status]}
        </Badge>
      </div>

      <div>
        <div className="flex justify-between text-sm mb-1">
          <span>{formatCurrency(debt.currentBalance)}</span>
          <span className="text-neutral-400">
            de {formatCurrency(debt.originalAmount)}
          </span>
        </div>
        <div className="h-2 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
          <div
            className="h-full bg-neutral-900 dark:bg-neutral-100"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <p className="text-xs text-neutral-500">
        Cuota mínima: {formatCurrency(debt.minimumPayment)} · Día de pago:{" "}
        {debt.dueDay}
      </p>

      <div className="flex flex-wrap gap-2 pt-1">
        <Button variant="primary" onClick={onRegisterPayment}>
          Registrar pago
        </Button>
        <Button variant="secondary" onClick={onViewHistory}>
          Historial
        </Button>
        <Button variant="secondary" onClick={onEdit}>
          Editar
        </Button>
        <Button variant="danger" onClick={onDelete}>
          Eliminar
        </Button>
      </div>
    </div>
  );
}
