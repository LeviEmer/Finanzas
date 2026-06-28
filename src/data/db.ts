import Dexie, { type EntityTable } from "dexie";
import type {
  AntExpense,
  Category,
  Debt,
  Expense,
  FinancialSnapshot,
  Income,
  Payment,
  Projection,
  Reminder,
  Settings,
} from "@/shared/types";

class FinanceDatabase extends Dexie {
  categories!: EntityTable<Category, "id">;
  debts!: EntityTable<Debt, "id">;
  payments!: EntityTable<Payment, "id">;
  incomes!: EntityTable<Income, "id">;
  expenses!: EntityTable<Expense, "id">;
  antExpenses!: EntityTable<AntExpense, "id">;
  reminders!: EntityTable<Reminder, "id">;
  settings!: EntityTable<Settings, "id">;
  projections!: EntityTable<Projection, "id">;
  financialSnapshots!: EntityTable<FinancialSnapshot, "id">;

  constructor() {
    super("FinanceDatabase");

    this.version(1).stores({
      categories: "id, kind, active",
      debts: "id, status, priority, dueDay",
      payments: "id, debtId, date",
      incomes: "id, kind, date",
      expenses: "id, categoryId, kind, date",
      antExpenses: "id, categoryId, date",
      reminders: "id, debtId, targetDate, status",
      settings: "id",
      projections: "id, generatedAt, scenarioType",
      financialSnapshots: "id, date",
    });
  }
}

export const db = new FinanceDatabase();
