export interface NavItem {
  path: string;
  label: string;
  primary: boolean;
}

export const navItems: NavItem[] = [
  { path: "/", label: "Dashboard", primary: true },
  { path: "/debts", label: "Deudas", primary: true },
  { path: "/ant-expenses", label: "Hormiga", primary: true },
  { path: "/calendar", label: "Calendario", primary: true },
  { path: "/income", label: "Ingresos", primary: false },
  { path: "/expenses", label: "Gastos", primary: false },
  { path: "/plan", label: "Plan inteligente", primary: false },
  { path: "/projections", label: "Proyecciones", primary: false },
  { path: "/reports", label: "Reportes", primary: false },
  { path: "/settings", label: "Configuración", primary: false },
];
