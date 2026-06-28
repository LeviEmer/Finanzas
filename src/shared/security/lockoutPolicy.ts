/**
 * Política de bloqueo progresivo tras intentos fallidos de PIN (mitigación
 * de fuerza bruta, OWASP A07 - Identification and Authentication Failures).
 */
const THRESHOLDS: { attempts: number; waitSeconds: number }[] = [
  { attempts: 3, waitSeconds: 15 },
  { attempts: 5, waitSeconds: 60 },
  { attempts: 8, waitSeconds: 300 },
];

export function getWaitSecondsForAttempts(failedAttempts: number): number {
  let wait = 0;
  for (const threshold of THRESHOLDS) {
    if (failedAttempts >= threshold.attempts) {
      wait = threshold.waitSeconds;
    }
  }
  return wait;
}
