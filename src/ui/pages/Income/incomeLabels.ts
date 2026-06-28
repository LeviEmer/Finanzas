import type { Income } from "@/shared/types";

export const incomeKindLabels: Record<Income["kind"], string> = {
  fixed: "Fijo",
  extra: "Extra",
};

export const incomeFrequencyLabels: Record<Income["frequency"], string> = {
  monthly: "Mensual",
  biweekly: "Quincenal",
  one_time: "Único",
};
