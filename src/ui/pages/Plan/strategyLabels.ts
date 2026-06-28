import type { PaymentStrategy } from "@/shared/types";

export const strategyLabels: Record<PaymentStrategy, string> = {
  minimum_plus_surplus: "Mínimos + excedente",
  snowball: "Bola de nieve",
  avalanche: "Avalancha",
  custom: "Personalizada (mi prioridad)",
};

export const strategyDescriptions: Record<PaymentStrategy, string> = {
  minimum_plus_surplus:
    "Paga las cuotas mínimas de todas las deudas y concentra el excedente según tu prioridad manual.",
  snowball:
    "Concentra el excedente en la deuda con menor saldo, para liquidar deudas rápido y ganar impulso.",
  avalanche:
    "Concentra el excedente en la deuda con mayor tasa de interés, para minimizar el interés total pagado.",
  custom:
    "Usa el orden de prioridad que definiste manualmente en cada deuda.",
};
