import { useEffect, useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { projectionService } from "@/services/projectionService";
import type { ScenarioComparison } from "@/services/projectionService";
import { formatCurrency } from "@/shared/utils/formatCurrency";
import { FormField } from "@/ui/components/FormField";
import type { PaymentStrategy } from "@/shared/types";
import { strategyLabels } from "@/ui/pages/Plan/strategyLabels";

const strategies: PaymentStrategy[] = [
  "minimum_plus_surplus",
  "snowball",
  "avalanche",
  "custom",
];

export function ProjectionsPage() {
  const [strategy, setStrategy] = useState<PaymentStrategy>("snowball");
  const [extraIncome, setExtraIncome] = useState("0");
  const [expenseReduction, setExpenseReduction] = useState("0");
  const [comparison, setComparison] = useState<ScenarioComparison | null>(null);
  const [loading, setLoading] = useState(true);

  async function runSimulation() {
    setLoading(true);
    const result = await projectionService.compareScenario({
      strategy,
      extraIncome: Number(extraIncome) || 0,
      expenseReduction: Number(expenseReduction) || 0,
    });
    setComparison(result);
    setLoading(false);
  }

  useEffect(() => {
    runSimulation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [strategy]);

  const chartData = comparison ? buildChartData(comparison) : [];
  const monthsSaved =
    comparison && comparison.baseline.feasible && comparison.scenario.feasible
      ? comparison.baseline.monthsToPayoff - comparison.scenario.monthsToPayoff
      : 0;

  return (
    <div className="pt-6 flex flex-col gap-5">
      <h1 className="text-xl font-semibold">Proyecciones y escenarios</h1>

      <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-5 flex flex-col gap-3">
        <p className="text-sm font-medium">Simulador "¿Qué pasa si...?"</p>

        <FormField label="Estrategia">
          <select
            className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
            value={strategy}
            onChange={(e) => setStrategy(e.target.value as PaymentStrategy)}
          >
            {strategies.map((s) => (
              <option key={s} value={s}>
                {strategyLabels[s]}
              </option>
            ))}
          </select>
        </FormField>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <FormField label="Ingreso extra mensual">
            <input
              type="number"
              min={0}
              step="0.01"
              inputMode="decimal"
              value={extraIncome}
              onChange={(e) => setExtraIncome(e.target.value)}
              className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
            />
          </FormField>
          <FormField label="Reducción de gastos mensual">
            <input
              type="number"
              min={0}
              step="0.01"
              inputMode="decimal"
              value={expenseReduction}
              onChange={(e) => setExpenseReduction(e.target.value)}
              className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
            />
          </FormField>
        </div>

        <button
          onClick={runSimulation}
          className="self-start rounded-lg bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 px-4 py-2 text-sm font-medium"
        >
          Simular escenario
        </button>
      </div>

      {loading || !comparison ? (
        <p className="text-neutral-500">Calculando proyección...</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SummaryCard
              label="Disponible actual (real)"
              value={formatCurrency(comparison.baselineMonthlySurplus)}
            />
            <SummaryCard
              label="Disponible en el escenario"
              value={formatCurrency(comparison.scenarioMonthlySurplus)}
            />
            <SummaryCard
              label="Meses que te ahorras"
              value={monthsSaved > 0 ? String(monthsSaved) : "0"}
            />
          </div>

          <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-5">
            <p className="text-sm font-medium mb-3">
              Saldo total de deuda proyectado
            </p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis
                    dataKey="month"
                    tickFormatter={(m) => `Mes ${m}`}
                    fontSize={12}
                  />
                  <YAxis
                    tickFormatter={(v) => formatCurrency(v)}
                    width={90}
                    fontSize={12}
                  />
                  <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                  <Line
                    type="monotone"
                    dataKey="baseline"
                    name="Plan actual"
                    stroke="#9ca3af"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="scenario"
                    name="Escenario simulado"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <p className="text-sm text-neutral-500">
            {comparison.baseline.feasible
              ? `Con tu plan actual saldrías de deudas en ${
                  comparison.baseline.monthsToPayoff
                } meses, alrededor de ${format(
                  comparison.baseline.debtFreeDate,
                  "MMMM yyyy",
                  { locale: es }
                )}.`
              : "Con tu disponible actual, el plan no es viable: las cuotas mínimas no cubren el interés generado."}
          </p>
        </>
      )}
    </div>
  );
}

function buildChartData(comparison: ScenarioComparison) {
  const maxMonth = Math.max(
    comparison.baseline.timeline.length,
    comparison.scenario.timeline.length
  );

  return Array.from({ length: maxMonth }, (_, month) => ({
    month,
    baseline: comparison.baseline.timeline[month]?.totalRemaining ?? 0,
    scenario: comparison.scenario.timeline[month]?.totalRemaining ?? 0,
  }));
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-5">
      <p className="text-sm text-neutral-500 mb-1">{label}</p>
      <p className="text-2xl font-semibold">{value}</p>
    </div>
  );
}
