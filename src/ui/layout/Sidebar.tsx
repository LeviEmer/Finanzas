import { NavLink } from "react-router-dom";
import { navItems } from "./navigation";

export function Sidebar() {
  return (
    <aside className="hidden md:flex md:w-60 md:flex-col md:border-r border-neutral-200 dark:border-neutral-800 md:py-6 md:px-3">
      <div className="px-3 mb-6 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
        Mis Finanzas
      </div>
      <nav className="flex flex-col gap-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900"
                  : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
