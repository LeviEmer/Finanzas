import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { reportService, type ReportPeriod, type ReportSummary } from "@/services/reportService";
import { formatCurrency } from "@/shared/utils/formatCurrency";
import { buildCsv } from "@/shared/security/csvSafety";
import { downloadTextFile } from "@/shared/utils/downloadFile";
import { Button } from "@/ui/components/Button";

const periods: { value: ReportPeriod; label: string }[] = [
  { value: "monthly", label: "Mes completo" },
  { value: "biweekly_first", label: "1ra quincena" },
  { value: "biweekly_second", label: "2da quincena" },
];

export function ReportsPage() {
  const [period, setPeriod] = useState<ReportPeriod>("monthly");
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    reportService.getSummary(period).then((data) => {
      setSummary(data);
      setLoading(false);
    });
  }, [period]);

  function handleExportCsv() {
    if (!summary) return;
    const csv = buildCsv(
      ["Categoría", "Monto"],
      summary.expensesByCategory.map((item) => [item.categoryName, item.amount])
    );
    downloadTextFile(csv, `reporte-gastos-${period}.csv`, "text/csv;charset=utf-8");
  }

  return (
    <div className="pt-6 flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Reportes</h1>
        <Button variant="secondary" onClick={handleExportCsv} disabled={!summary}>
          Exportar CSV
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {periods.map((p) => (
          <button
            key={p.value}
            onClick={() => setPeriod(p.value)}
            className={`rounded-full px-4 py-2 text-sm border transition-colors ${
              period === p.value
                ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 border-transparent"
                : "border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {loading || !summary ? (
        <p className="text-neutral-500">Cargando reporte...</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SummaryCard
              label="Ingresos del periodo"
              value={formatCurrency(summary.totalIncome)}
            />
            <SummaryCard
              label="Gastos del periodo"
              value={formatCurrency(summary.totalExpenses + summary.totalAntExpenses)}
            />
            <SummaryCard
              label="Flujo de caja"
              value={formatCurrency(summary.cashFlow)}
              tone={summary.cashFlow >= 0 ? "positive" : "negative"}
            />
          </div>

          <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-5">
            <p className="text-sm font-medium mb-3">Gastos por categoría</p>
            {summary.expensesByCategory.length === 0 ? (
              <p className="text-sm text-neutral-500">
                No hay gastos registrados en este periodo.
              </p>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={summary.expensesByCategory}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="categoryName" fontSize={12} />
                    <YAxis
                      tickFormatter={(v) => formatCurrency(v)}
                      width={90}
                      fontSize={12}
                    />
                    <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                    <Bar dataKey="amount" fill="#3b82f6" radius={4} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-5">
            <p className="text-sm font-medium mb-2">Avance de deuda</p>
            <div className="flex justify-between text-sm mb-1">
              <span>{formatCurrency(summary.debtProgress.totalRemaining)} restante</span>
              <span className="text-neutral-400">
                de {formatCurrency(summary.debtProgress.totalOriginal)}
              </span>
            </div>
            <div className="h-2 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
              <div
                className="h-full bg-neutral-900 dark:bg-neutral-100"
                style={{ width: `${Math.min(100, summary.debtProgress.percentagePaid)}%` }}
              />
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              {summary.debtProgress.percentagePaid.toFixed(1)}% pagado en total
            </p>
          </div>

          <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-5">
            <p className="text-sm font-medium mb-1">Gastos hormiga</p>
            <p className="text-2xl font-bold">
              {formatCurrency(summary.totalAntExpenses)}
            </p>
            {summary.antExpensePercentageOfIncome > 0 && (
              <p className="text-xs text-neutral-500 mt-1">
                {summary.antExpensePercentageOfIncome.toFixed(1)}% de tus
                ingresos del periodo
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "positive" | "negative";
}) {
  const toneClass =
    tone === "positive"
      ? "text-green-600 dark:text-green-400"
      : tone === "negative"
      ? "text-red-600 dark:text-red-400"
      : "";

  return (
    <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-5">
      <p className="text-sm text-neutral-500 mb-1">{label}</p>
      <p className={`text-2xl font-semibold ${toneClass}`}>{value}</p>
    </div>
  );
}
