import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "@/ui/components/Badge";
import { Button } from "@/ui/components/Button";
import { formatCurrency } from "@/shared/utils/formatCurrency";
import type { CalendarEntry, CalendarGroups } from "@/services/calendarService";
import { alertTone } from "./calendarLabels";

interface CalendarGroupedListProps {
  groups: CalendarGroups;
  onRegisterPayment: (entry: CalendarEntry) => void;
  onEditDueDate: (entry: CalendarEntry) => void;
}

const sections: { key: keyof CalendarGroups; title: string }[] = [
  { key: "overdue", title: "Atrasados" },
  { key: "dueToday", title: "Hoy" },
  { key: "dueThisWeek", title: "Esta semana" },
  { key: "dueThisMonth", title: "Este mes" },
];

export function CalendarGroupedList({
  groups,
  onRegisterPayment,
  onEditDueDate,
}: CalendarGroupedListProps) {
  const hasAny = sections.some((s) => groups[s.key].length > 0);

  if (!hasAny) {
    return (
      <p className="text-neutral-500">
        No tienes pagos próximos registrados. ¡Vas bien!
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {sections.map(({ key, title }) => {
        const items = groups[key];
        if (items.length === 0) return null;

        return (
          <div key={key}>
            <p className="text-sm font-medium text-neutral-500 mb-2">
              {title}
            </p>
            <div className="flex flex-col gap-2">
              {items.map((entry) => (
                <div
                  key={entry.debt.id}
                  className="rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-4 flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium">{entry.debt.name}</p>
                    <p className="text-xs text-neutral-500 capitalize">
                      {format(entry.dueDate, "d 'de' MMMM", { locale: es })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge tone={alertTone(entry.alertType)}>
                      {formatCurrency(entry.debt.minimumPayment)}
                    </Badge>
                    <Button
                      variant="secondary"
                      onClick={() => onEditDueDate(entry)}
                    >
                      Cambiar fecha
                    </Button>
                    <Button onClick={() => onRegisterPayment(entry)}>
                      Marcar pagado
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
