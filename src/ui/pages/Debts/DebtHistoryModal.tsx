import { Modal } from "@/ui/components/Modal";
import { formatCurrency } from "@/shared/utils/formatCurrency";
import { paymentSourceLabels, paymentTypeLabels } from "./debtLabels";
import type { Debt, Payment } from "@/shared/types";

interface DebtHistoryModalProps {
  open: boolean;
  debt: Debt | null;
  payments: Payment[];
  onClose: () => void;
}

export function DebtHistoryModal({
  open,
  debt,
  payments,
  onClose,
}: DebtHistoryModalProps) {
  if (!debt) return null;

  return (
    <Modal open={open} onClose={onClose} title={`Historial — ${debt.name}`}>
      {payments.length === 0 ? (
        <p className="text-sm text-neutral-500">
          Aún no hay pagos registrados para esta deuda.
        </p>
      ) : (
        <ul className="flex flex-col gap-2 max-h-96 overflow-y-auto">
          {payments
            .slice()
            .reverse()
            .map((payment) => (
              <li
                key={payment.id}
                className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-3 text-sm"
              >
                <div className="flex justify-between">
                  <span className="font-medium">
                    {formatCurrency(payment.amount)}
                  </span>
                  <span className="text-neutral-500">{payment.date}</span>
                </div>
                <p className="text-xs text-neutral-500 mt-1">
                  {paymentTypeLabels[payment.type]} ·{" "}
                  {paymentSourceLabels[payment.source]} · Saldo restante:{" "}
                  {formatCurrency(payment.remainingBalanceAfter)}
                </p>
                {payment.notes && (
                  <p className="text-xs text-neutral-400 mt-1">
                    {payment.notes}
                  </p>
                )}
              </li>
            ))}
        </ul>
      )}
    </Modal>
  );
}
