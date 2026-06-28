import { useEffect, useState } from "react";
import { calendarService, type CalendarEntry } from "@/services/calendarService";
import { debtService } from "@/services/debtService";
import { Modal } from "@/ui/components/Modal";
import { Button } from "@/ui/components/Button";
import { PaymentFormModal } from "@/ui/pages/Debts/PaymentFormModal";
import { formatCurrency } from "@/shared/utils/formatCurrency";
import {
  isDismissedToday,
  markDismissedToday,
} from "@/shared/utils/duePromptStorage";
import type { Debt, Payment } from "@/shared/types";

/**
 * Cuando llega (o ya pasó) el día de pago de una deuda y todavía no se ha
 * preguntado hoy, se muestra un prompt "¿la pagaste?". Evita preguntar más
 * de una vez al día por deuda (Fase 1: no hay que generar fatiga de avisos).
 */
export function DuePaymentPrompt() {
  const [queue, setQueue] = useState<CalendarEntry[]>([]);
  const [paymentDebt, setPaymentDebt] = useState<Debt | null>(null);

  useEffect(() => {
    calendarService.getEntries().then((entries) => {
      const pending = entries.filter(
        (e) =>
          (e.alertType === "due_today" || e.alertType === "overdue") &&
          !isDismissedToday(e.debt.id)
      );
      setQueue(pending);
    });
  }, []);

  const current = queue[0] ?? null;

  function advanceQueue() {
    setQueue((prev) => prev.slice(1));
  }

  function handleNo() {
    if (!current) return;
    markDismissedToday(current.debt.id);
    advanceQueue();
  }

  function handleYes() {
    if (!current) return;
    setPaymentDebt(current.debt);
  }

  async function handleRegisterPayment(
    debt: Debt,
    payment: Omit<Payment, "id" | "remainingBalanceAfter" | "createdAt">
  ) {
    await debtService.recordPayment(debt, payment);
    markDismissedToday(debt.id);
    setPaymentDebt(null);
    advanceQueue();
  }

  return (
    <>
      <Modal
        open={current !== null}
        onClose={handleNo}
        title="Confirmar pago"
      >
        {current && (
          <div className="flex flex-col gap-4">
            <p className="text-sm">
              ¿Ya pagaste <strong>{current.debt.name}</strong>
              {current.alertType === "overdue" ? " (atrasado)" : " hoy"}?
            </p>
            <p className="text-xs text-neutral-500">
              Cuota mínima: {formatCurrency(current.debt.minimumPayment)}
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={handleNo}>
                Todavía no
              </Button>
              <Button onClick={handleYes}>Sí, ya la pagué</Button>
            </div>
          </div>
        )}
      </Modal>

      <PaymentFormModal
        open={paymentDebt !== null}
        debt={paymentDebt}
        onClose={() => setPaymentDebt(null)}
        onSubmit={handleRegisterPayment}
      />
    </>
  );
}
