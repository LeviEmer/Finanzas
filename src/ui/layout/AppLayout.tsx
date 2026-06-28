import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { TabBar } from "./TabBar";
import { useThemeStore } from "@/app/providers/themeStore";

export function AppLayout() {
  const { darkMode, toggleDarkMode } = useThemeStore();

  return (
    <div className="flex min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <header className="flex justify-end px-4 py-3 md:px-6">
          <button
            onClick={toggleDarkMode}
            className="text-sm rounded-lg border border-neutral-200 dark:border-neutral-800 px-3 py-1.5 text-neutral-600 dark:text-neutral-300"
          >
            {darkMode ? "Modo claro" : "Modo oscuro"}
          </button>
        </header>
        <main className="flex-1 px-4 pb-20 md:px-6 md:pb-6">
          <Outlet />
        </main>
      </div>
      <TabBar />
    </div>
  );
}
