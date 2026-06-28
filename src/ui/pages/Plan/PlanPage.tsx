import { useEffect, useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { planService, type PlanResult } from "@/services/planService";
import { formatCurrency } from "@/shared/utils/formatCurrency";
import { Badge } from "@/ui/components/Badge";
import { strategyDescriptions, strategyLabels } from "./strategyLabels";
import type { PaymentStrategy } from "@/shared/types";

const strategies: PaymentStrategy[] = [
  "minimum_plus_surplus",
  "snowball",
  "avalanche",
  "custom",
];

export function PlanPage() {
  const [strategy, setStrategy] = useState<PaymentStrategy>("snowball");
  const [plan, setPlan] = useState<PlanResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    planService.buildPlan(strategy).then((result) => {
      setPlan(result);
      setLoading(false);
    });
  }, [strategy]);

  return (
    <div className="pt-6 flex flex-col gap-5">
      <h1 className="text-xl font-semibold">Plan inteligente de pagos</h1>

      <div className="flex flex-wrap gap-2">
        {strategies.map((s) => (
          <button
            key={s}
            onClick={() => setStrategy(s)}
            className={`rounded-full px-4 py-2 text-sm border transition-colors ${
              strategy === s
                ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 border-transparent"
                : "border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300"
            }`}
          >
            {strategyLabels[s]}
          </button>
        ))}
      </div>
      <p className="text-sm text-neutral-500">{strategyDescriptions[strategy]}</p>

      {loading || !plan ? (
        <p className="text-neutral-500">Calculando plan...</p>
      ) : plan.orderedDebts.length === 0 ? (
        <p className="text-neutral-500">
          No tienes deudas activas. ¡Nada que planear!
        </p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SummaryCard
              label="Excedente mensual disponible"
              value={formatCurrency(plan.monthlySurplus)}
            />
            <SummaryCard
              label="Meses para salir de deudas"
              value={
                plan.simulation.feasible
                  ? String(plan.simulation.monthsToPayoff)
                  : "No alcanzable"
              }
            />
            <SummaryCard
              label="Fecha estimada de libertad financiera"
              value={
                plan.simulation.feasible
                  ? format(plan.simulation.debtFreeDate, "MMMM yyyy", {
                      locale: es,
                    })
                  : "—"
              }
            />
          </div>

          {!plan.simulation.feasible && (
            <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 p-4 text-sm text-red-700 dark:text-red-400">
              Con tu excedente actual, las cuotas mínimas no logran cubrir el
              interés generado. Necesitas aumentar tu excedente o renegociar
              tasas para que este plan sea viable.
            </div>
          )}

          <div>
            <p className="text-sm font-medium text-neutral-500 mb-2">
              Orden de pago sugerido
            </p>
            <div className="flex flex-col gap-2">
              {plan.orderedDebts.map((debt, index) => (
                <div
                  key={debt.id}
                  className="rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800 text-xs font-semibold">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium">{debt.name}</p>
                      <p className="text-xs text-neutral-500">
                        Saldo: {formatCurrency(debt.currentBalance)}
                      </p>
                    </div>
                  </div>
                  {debt.interestRate ? (
                    <Badge tone="neutral">{debt.interestRate}% interés</Badge>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-5">
      <p className="text-sm text-neutral-500 mb-1">{label}</p>
      <p className="text-2xl font-semibold">{value}</p>
    </div>
  );
}
