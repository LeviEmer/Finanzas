import { z } from "zod";

/**
 * Reglas generales de validación (defensa en profundidad, OWASP A03/A04):
 * - Todo monto debe ser finito, positivo y acotado a un máximo razonable
 *   para evitar overflow/NaN/Infinity corrompiendo los cálculos financieros.
 * - Todo texto libre se recorta (trim) y se limita en longitud para evitar
 *   payloads anómalos almacenados en IndexedDB.
 */
const MAX_AMOUNT = 100_000_000;

const safeAmount = z
  .number()
  .finite("El monto debe ser un número válido")
  .positive("El monto debe ser mayor a 0")
  .max(MAX_AMOUNT, "El monto excede el máximo permitido");

const safeNonNegativeAmount = z
  .number()
  .finite("El monto debe ser un número válido")
  .nonnegative("El monto no puede ser negativo")
  .max(MAX_AMOUNT, "El monto excede el máximo permitido");

const safeText = (maxLength: number) =>
  z
    .string()
    .trim()
    .min(1, "Este campo es obligatorio")
    .max(maxLength, `Máximo ${maxLength} caracteres`);

const safeOptionalText = (maxLength: number) =>
  z
    .string()
    .trim()
    .max(maxLength, `Máximo ${maxLength} caracteres`)
    .optional();

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}/, "Fecha inválida");

export const debtSchema = z.object({
  name: safeText(80),
  type: z.enum([
    "credit_card",
    "personal_loan",
    "mortgage",
    "auto_loan",
    "personal",
    "other",
  ]),
  originalAmount: safeAmount,
  currentBalance: safeNonNegativeAmount,
  minimumPayment: safeNonNegativeAmount,
  interestRate: z
    .number()
    .finite()
    .min(0)
    .max(100, "La tasa no puede superar 100%")
    .optional(),
  dueDay: z.number().int().min(1).max(31),
  priority: z.union([
    z.literal(1),
    z.literal(2),
    z.literal(3),
    z.literal(4),
    z.literal(5),
  ]),
  notes: safeOptionalText(500),
});

export type DebtFormValues = z.infer<typeof debtSchema>;

export const paymentSchema = z.object({
  amount: safeAmount,
  type: z.enum(["partial", "full", "minimum"]),
  date: isoDate,
  source: z.enum(["salary", "extra_income", "savings"]),
  notes: safeOptionalText(300),
});

export type PaymentFormValues = z.infer<typeof paymentSchema>;

export const incomeSchema = z.object({
  kind: z.enum(["fixed", "extra"]),
  amount: safeAmount,
  date: isoDate,
  frequency: z.enum(["monthly", "biweekly", "one_time"]),
  source: safeText(80),
});

export type IncomeFormValues = z.infer<typeof incomeSchema>;

export const expenseSchema = z.object({
  categoryId: safeText(80),
  kind: z.enum(["fixed", "variable"]),
  amount: safeAmount,
  date: isoDate,
  recurring: z.boolean(),
  description: safeText(120),
});

export type ExpenseFormValues = z.infer<typeof expenseSchema>;

export const antExpenseSchema = z.object({
  categoryId: safeText(80),
  amount: z
    .number()
    .finite()
    .positive("El monto debe ser mayor a 0")
    .max(100_000, "Monto inusualmente alto para un gasto hormiga"),
  date: isoDate,
  description: safeOptionalText(120).default(""),
});

export type AntExpenseFormValues = z.infer<typeof antExpenseSchema>;

export const settingsSchema = z.object({
  currency: z
    .string()
    .trim()
    .min(1)
    .max(8),
  salaryType: z.enum(["monthly", "biweekly"]),
  payDays: z
    .array(z.number().int().min(1).max(31))
    .min(1, "Agrega al menos un día de pago"),
  savingsGoalPercentage: z.number().min(0).max(100),
  antExpenseThresholdPercentage: z.number().min(0).max(100),
  minimumCushion: safeNonNegativeAmount,
  reminderLeadDays: z.number().int().min(0).max(30),
});

export type SettingsFormValues = z.infer<typeof settingsSchema>;

export const pinSchema = z
  .string()
  .regex(/^\d{4,8}$/, "El PIN debe tener entre 4 y 8 dígitos numéricos");
