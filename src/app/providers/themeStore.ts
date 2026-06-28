import { create } from "zustand";

interface ThemeState {
  darkMode: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (value: boolean) => void;
}

const STORAGE_KEY = "finance-app-dark-mode";

function getInitialDarkMode(): boolean {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored !== null) return stored === "true";
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function applyDarkModeClass(value: boolean) {
  document.documentElement.classList.toggle("dark", value);
  localStorage.setItem(STORAGE_KEY, String(value));
}

export const useThemeStore = create<ThemeState>((set, get) => {
  const initial = getInitialDarkMode();
  applyDarkModeClass(initial);

  return {
    darkMode: initial,
    toggleDarkMode: () => {
      const next = !get().darkMode;
      applyDarkModeClass(next);
      set({ darkMode: next });
    },
    setDarkMode: (value: boolean) => {
      applyDarkModeClass(value);
      set({ darkMode: value });
    },
  };
});
