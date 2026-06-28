import { useEffect, useState } from "react";
import { calendarService, type CalendarEntry, type CalendarGroups } from "@/services/calendarService";
import { debtService } from "@/services/debtService";
import { CalendarMonthGrid } from "./CalendarMonthGrid";
import { CalendarGroupedList } from "./CalendarGroupedList";
import { Modal } from "@/ui/components/Modal";
import { Button } from "@/ui/components/Button";
import { formatCurrency } from "@/shared/utils/formatCurrency";
import { PaymentFormModal } from "@/ui/pages/Debts/PaymentFormModal";
import type { Debt, Payment } from "@/shared/types";

export function CalendarPage() {
  const [entries, setEntries] = useState<CalendarEntry[]>([]);
  const [groups, setGroups] = useState<CalendarGroups | null>(null);
  const [loading, setLoading] = useState(true);
  const [dayEntries, setDayEntries] = useState<CalendarEntry[] | null>(null);
  const [paymentDebt, setPaymentDebt] = useState<Debt | null>(null);

  async function reload() {
    const referenceDate = new Date();
    const [entriesData, groupsData] = await Promise.all([
      calendarService.getEntries(referenceDate),
      calendarService.getGroups(referenceDate),
    ]);
    setEntries(entriesData);
    setGroups(groupsData);
    setLoading(false);
  }

  useEffect(() => {
    reload();
  }, []);

  async function handleRegisterPayment(
    debt: Debt,
    payment: Omit<Payment, "id" | "remainingBalanceAfter" | "createdAt">
  ) {
    await debtService.recordPayment(debt, payment);
    setDayEntries(null);
    await reload();
  }

  return (
    <div className="pt-6 flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Calendario de pagos</h1>

      {loading || !groups ? (
        <p className="text-neutral-500">Cargando...</p>
      ) : (
        <>
          <CalendarMonthGrid
            referenceDate={new Date()}
            entries={entries}
            onSelectDay={setDayEntries}
          />

          <div className="md:hidden">
            <CalendarGroupedList
              groups={groups}
              onRegisterPayment={(entry) => setPaymentDebt(entry.debt)}
            />
          </div>

          <div className="hidden md:block">
            <CalendarGroupedList
              groups={groups}
              onRegisterPayment={(entry) => setPaymentDebt(entry.debt)}
            />
          </div>
        </>
      )}

      <Modal
        open={dayEntries !== null}
        onClose={() => setDayEntries(null)}
        title="Pagos de este día"
      >
        <div className="flex flex-col gap-2">
          {dayEntries?.map((entry) => (
            <div
              key={entry.debt.id}
              className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-3 flex items-center justify-between"
            >
              <div>
                <p className="font-medium text-sm">{entry.debt.name}</p>
                <p className="text-xs text-neutral-500">
                  {formatCurrency(entry.debt.minimumPayment)}
                </p>
              </div>
              <Button onClick={() => setPaymentDebt(entry.debt)}>
                Marcar pagado
              </Button>
            </div>
          ))}
        </div>
      </Modal>

      <PaymentFormModal
        open={paymentDebt !== null}
        debt={paymentDebt}
        onClose={() => setPaymentDebt(null)}
        onSubmit={handleRegisterPayment}
      />
    </div>
  );
}
