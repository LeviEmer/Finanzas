import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "@/ui/layout/AppLayout";
import { DashboardPage } from "@/ui/pages/Dashboard/DashboardPage";
import { DebtsPage } from "@/ui/pages/Debts/DebtsPage";
import { IncomePage } from "@/ui/pages/Income/IncomePage";
import { ExpensesPage } from "@/ui/pages/Expenses/ExpensesPage";
import { AntExpensesPage } from "@/ui/pages/AntExpenses/AntExpensesPage";
import { CalendarPage } from "@/ui/pages/Calendar/CalendarPage";
import { PlanPage } from "@/ui/pages/Plan/PlanPage";
import { ProjectionsPage } from "@/ui/pages/Projections/ProjectionsPage";
import { ReportsPage } from "@/ui/pages/Reports/ReportsPage";
import { SettingsPage } from "@/ui/pages/Settings/SettingsPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "debts", element: <DebtsPage /> },
      {
        path: "ant-expenses",
        element: <AntExpensesPage />,
      },
      { path: "calendar", element: <CalendarPage /> },
      { path: "income", element: <IncomePage /> },
      { path: "expenses", element: <ExpensesPage /> },
      { path: "plan", element: <PlanPage /> },
      {
        path: "projections",
        element: <ProjectionsPage />,
      },
      { path: "reports", element: <ReportsPage /> },
      {
        path: "settings",
        element: <SettingsPage />,
      },
    ],
  },
]);
