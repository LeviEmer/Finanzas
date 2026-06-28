import {
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  isSameDay,
  startOfMonth,
} from "date-fns";
import { es } from "date-fns/locale";
import type { CalendarEntry } from "@/services/calendarService";
import { alertDotColor } from "./calendarLabels";

interface CalendarMonthGridProps {
  referenceDate: Date;
  entries: CalendarEntry[];
  onSelectDay: (entries: CalendarEntry[]) => void;
}

const weekDayLabels = ["L", "M", "X", "J", "V", "S", "D"];

export function CalendarMonthGrid({
  referenceDate,
  entries,
  onSelectDay,
}: CalendarMonthGridProps) {
  const monthStart = startOfMonth(referenceDate);
  const monthEnd = endOfMonth(referenceDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const leadingBlanks = (getDay(monthStart) + 6) % 7;

  return (
    <div className="hidden md:block">
      <p className="text-sm font-medium mb-3 capitalize">
        {format(referenceDate, "MMMM yyyy", { locale: es })}
      </p>
      <div className="grid grid-cols-7 gap-1 text-xs text-neutral-400 mb-1">
        {weekDayLabels.map((d) => (
          <div key={d} className="text-center">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: leadingBlanks }).map((_, i) => (
          <div key={`blank-${i}`} />
        ))}
        {days.map((day) => {
          const dayEntries = entries.filter((e) =>
            isSameDay(e.dueDate, day)
          );
          return (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() => dayEntries.length > 0 && onSelectDay(dayEntries)}
              className={`aspect-square rounded-lg border text-sm flex flex-col items-center justify-center gap-1 ${
                dayEntries.length > 0
                  ? "border-neutral-300 dark:border-neutral-700 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  : "border-transparent text-neutral-400"
              }`}
            >
              <span>{format(day, "d")}</span>
              {dayEntries.length > 0 && (
                <div className="flex gap-0.5">
                  {dayEntries.slice(0, 3).map((entry) => (
                    <span
                      key={entry.debt.id}
                      className={`h-1.5 w-1.5 rounded-full ${alertDotColor(
                        entry.alertType
                      )}`}
                    />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
