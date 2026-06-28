import { useState, type ReactNode } from "react";
import { useAppLockStore } from "@/app/providers/appLockStore";
import { Button } from "@/ui/components/Button";
import { pinSchema } from "@/shared/validation/schemas";

export function AppLockGate({ children }: { children: ReactNode }) {
  const { configured, unlocked, setupPin, unlock, error } = useAppLockStore();
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [skippedSetup, setSkippedSetup] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (unlocked || skippedSetup) {
    return <>{children}</>;
  }

  if (!configured) {
    async function handleSetup(e: React.FormEvent) {
      e.preventDefault();
      setLocalError(null);

      const result = pinSchema.safeParse(pin);
      if (!result.success) {
        setLocalError(result.error.issues[0].message);
        return;
      }
      if (pin !== confirmPin) {
        setLocalError("Los PIN no coinciden");
        return;
      }

      setSubmitting(true);
      await setupPin(pin);
      setSubmitting(false);
    }

    return (
      <LockScreenShell title="Protege tu información financiera">
        <p className="text-sm text-neutral-500 mb-4">
          Configura un PIN de 4 a 8 dígitos para proteger el acceso a esta
          app en tu dispositivo. Tus datos viven solo aquí, así que este PIN
          es tu única barrera de acceso local.
        </p>
        <form onSubmit={handleSetup} className="flex flex-col gap-3">
          <input
            type="password"
            inputMode="numeric"
            placeholder="Nuevo PIN"
            value={pin}
            maxLength={8}
            onChange={(e) => setPin(e.target.value)}
            className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm text-center tracking-widest"
          />
          <input
            type="password"
            inputMode="numeric"
            placeholder="Confirmar PIN"
            value={confirmPin}
            maxLength={8}
            onChange={(e) => setConfirmPin(e.target.value)}
            className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm text-center tracking-widest"
          />
          {localError && (
            <p className="text-xs text-red-600 text-center">{localError}</p>
          )}
          <Button type="submit" disabled={submitting}>
            Activar PIN
          </Button>
          <button
            type="button"
            onClick={() => setSkippedSetup(true)}
            className="text-xs text-neutral-400 underline"
          >
            Omitir por ahora (no recomendado)
          </button>
        </form>
      </LockScreenShell>
    );
  }

  async function handleUnlock(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const ok = await unlock(pin);
    setSubmitting(false);
    if (ok) setPin("");
  }

  return (
    <LockScreenShell title="App bloqueada">
      <form onSubmit={handleUnlock} className="flex flex-col gap-3">
        <input
          type="password"
          inputMode="numeric"
          autoFocus
          placeholder="Ingresa tu PIN"
          value={pin}
          maxLength={8}
          onChange={(e) => setPin(e.target.value)}
          className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm text-center tracking-widest"
        />
        {error && (
          <p className="text-xs text-red-600 text-center">{error}</p>
        )}
        <Button type="submit" disabled={submitting}>
          Desbloquear
        </Button>
      </form>
    </LockScreenShell>
  );
}

function LockScreenShell({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6">
        <h1 className="text-lg font-semibold mb-2 text-center">{title}</h1>
        {children}
      </div>
    </div>
  );
}
