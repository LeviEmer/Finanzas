import { NavLink } from "react-router-dom";
import { navItems } from "./navigation";

const primaryItems = navItems.filter((item) => item.primary);

export function TabBar() {
  return (
    <nav className="app-mobile-tabbar fixed bottom-0 left-0 right-0 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
      {primaryItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            `flex-1 py-3 text-center text-xs font-medium ${
              isActive
                ? "text-neutral-900 dark:text-neutral-100"
                : "text-neutral-400"
            }`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
