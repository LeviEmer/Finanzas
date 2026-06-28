import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "@/app/router";
import { categoryService } from "@/services/categoryService";
import { AppLockGate } from "@/ui/security/AppLockGate";
import { useAppLockStore } from "@/app/providers/appLockStore";

const AUTO_LOCK_AFTER_MS = 5 * 60 * 1000;

function App() {
  const lockNow = useAppLockStore((state) => state.lockNow);

  useEffect(() => {
    categoryService.ensureDefaults();
  }, []);

  useEffect(() => {
    let timeoutId: number | undefined;

    function scheduleAutoLock() {
      if (timeoutId) window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(lockNow, AUTO_LOCK_AFTER_MS);
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "hidden") {
        lockNow();
      } else {
        scheduleAutoLock();
      }
    }

    const resetEvents = ["mousedown", "keydown", "touchstart"];
    resetEvents.forEach((event) =>
      window.addEventListener(event, scheduleAutoLock)
    );
    document.addEventListener("visibilitychange", handleVisibilityChange);
    scheduleAutoLock();

    return () => {
      if (timeoutId) window.clearTimeout(timeoutId);
      resetEvents.forEach((event) =>
        window.removeEventListener(event, scheduleAutoLock)
      );
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [lockNow]);

  return (
    <AppLockGate>
      <RouterProvider router={router} />
    </AppLockGate>
  );
}

export default App;
