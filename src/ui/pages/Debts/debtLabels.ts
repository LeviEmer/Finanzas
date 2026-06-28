import type { Debt, Payment } from "@/shared/types";

export const debtTypeLabels: Record<Debt["type"], string> = {
  credit_card: "Tarjeta de crédito",
  personal_loan: "Préstamo personal",
  mortgage: "Hipoteca",
  auto_loan: "Crédito automotriz",
  personal: "Deuda personal",
  other: "Otro",
};

export const debtStatusLabels: Record<Debt["status"], string> = {
  active: "Activa",
  paid_off: "Pagada",
  at_risk: "En peligro",
};

export const paymentSourceLabels: Record<Payment["source"], string> = {
  salary: "Sueldo",
  extra_income: "Ingreso extra",
  savings: "Ahorro",
};

export const paymentTypeLabels: Record<Payment["type"], string> = {
  partial: "Parcial",
  full: "Completo",
  minimum: "Cuota mínima",
};
