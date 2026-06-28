import type { CalendarEntry } from "@/services/calendarService";

export function alertTone(alertType: CalendarEntry["alertType"]) {
  switch (alertType) {
    case "overdue":
      return "danger" as const;
    case "due_today":
      return "danger" as const;
    case "due_this_week":
      return "warning" as const;
    default:
      return "neutral" as const;
  }
}

export function alertDotColor(alertType: CalendarEntry["alertType"]) {
  switch (alertType) {
    case "overdue":
    case "due_today":
      return "bg-red-500";
    case "due_this_week":
      return "bg-amber-500";
    default:
      return "bg-neutral-400";
  }
}
