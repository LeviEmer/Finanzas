import type { ReactNode } from "react";

type BadgeTone = "neutral" | "success" | "warning" | "danger";

const toneClasses: Record<BadgeTone, string> = {
  neutral: "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
  success: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400",
  warning: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
  danger: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
};

export function Badge({
  tone = "neutral",
  children,
}: {
  tone?: BadgeTone;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${toneClasses[tone]}`}
    >
      {children}
    </span>
  );
}
