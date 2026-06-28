import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { dashboardService, type DashboardSummary } from "@/services/dashboardService";
import { calendarService, type CalendarEntry } from "@/services/calendarService";
import { recommendationService } from "@/services/recommendationService";
import type { Recommendation } from "@/domain/recommendations/generateRecommendations";
import { formatCurrency } from "@/shared/utils/formatCurrency";
import { Badge } from "@/ui/components/Badge";
import { alertTone } from "@/ui/pages/Calendar/calendarLabels";

const severityStyles = {
  info: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-400",
  warning:
    "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-900 text-amber-700 dark:text-amber-400",
  critical:
    "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900 text-red-700 dark:text-red-400",
} as const;

export function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [upcomingPayments, setUpcomingPayments] = useState<CalendarEntry[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      dashboardService.getSummary(),
      calendarService.getEntries(),
      recommendationService.getRecommendations(),
    ]).then(([summaryData, entries, recs]) => {
      setSummary(summaryData);
      setUpcomingPayments(entries.slice(0, 5));
      setRecommendations(recs);
      setLoading(false);
    });
  }, []);

  if (loading || !summary) {
    return <p className="pt-6 text-neutral-500">Cargando dashboard...</p>;
  }

  return (
    <div className="pt-6 flex flex-col gap-6">
      <section className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6">
        <p className="text-sm text-neutral-500 mb-1">Disponible real</p>
        <p className="text-4xl font-bold">
          {formatCurrency(summary.balance.availableBalance)}
        </p>
      </section>

      {recommendations.length > 0 && (
        <section className="flex flex-col gap-2">
          {recommendations.slice(0, 2).map((rec) => (
            <div
              key={rec.id}
              className={`rounded-xl border p-4 text-sm ${severityStyles[rec.severity]}`}
            >
              {rec.message}
            </div>
          ))}
        </section>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard
          label="Deudas activas"
          value={String(summary.activeDebtsCount)}
        />
        <SummaryCard
          label="Saldo restante de deuda"
          value={formatCurrency(summary.totalRemainingDebt)}
        />
        <SummaryCard
          label="Gastos hormiga del mes"
          value={formatCurrency(summary.balance.totalAntExpenses)}
        />
      </div>

      <section className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium">Próximos pagos</p>
          <Link
            to="/calendar"
            className="text-xs text-neutral-500 underline"
          >
            Ver calendario
          </Link>
        </div>
        {upcomingPayments.length === 0 ? (
          <p className="text-sm text-neutral-500">
            No tienes pagos próximos registrados.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {upcomingPayments.map((entry) => (
              <div
                key={entry.debt.id}
                className="flex items-center justify-between text-sm"
              >
                <div>
                  <p className="font-medium">{entry.debt.name}</p>
                  <p className="text-xs text-neutral-500 capitalize">
                    {format(entry.dueDate, "d 'de' MMMM", { locale: es })}
                  </p>
                </div>
                <Badge tone={alertTone(entry.alertType)}>
                  {formatCurrency(entry.debt.minimumPayment)}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </section>
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
