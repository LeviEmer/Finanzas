import type { Category } from "@/shared/types";

export const defaultExpenseCategories: Omit<Category, "id" | "createdAt" | "updatedAt"> [] = [
  { name: "Renta", kind: "fixed", color: "#3b82f6", active: true },
  { name: "Servicios", kind: "fixed", color: "#06b6d4", active: true },
  { name: "Transporte", kind: "variable", color: "#f59e0b", active: true },
  { name: "Comida", kind: "variable", color: "#10b981", active: true },
  { name: "Entretenimiento", kind: "variable", color: "#8b5cf6", active: true },
  { name: "Suscripciones", kind: "fixed", color: "#ec4899", active: true },
  { name: "Otros", kind: "variable", color: "#6b7280", active: true },
];

export const defaultAntExpenseCategories: Omit<Category, "id" | "createdAt" | "updatedAt">[] = [
  { name: "Café/Snacks", kind: "ant", color: "#f59e0b", active: true },
  { name: "Antojos", kind: "ant", color: "#ef4444", active: true },
  { name: "Apps/Delivery", kind: "ant", color: "#8b5cf6", active: true },
  { name: "Otros", kind: "ant", color: "#6b7280", active: true },
];
