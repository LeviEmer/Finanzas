const PBKDF2_ITERATIONS = 150_000;
const HASH_ALGORITHM = "SHA-256";

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function generateSalt(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return toHex(bytes.buffer);
}

function hexToBytes(hex: string): ArrayBuffer {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return bytes.buffer;
}

/**
 * Deriva un hash del PIN con PBKDF2 (Web Crypto) en vez de almacenarlo en
 * texto plano o con un hash rápido (mitiga ataques de fuerza bruta offline
 * sobre el almacenamiento local, en línea con OWASP A02/A07).
 */
export async function hashPin(pin: string, saltHex: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(pin),
    "PBKDF2",
    false,
    ["deriveBits"]
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: hexToBytes(saltHex),
      iterations: PBKDF2_ITERATIONS,
      hash: HASH_ALGORITHM,
    },
    keyMaterial,
    256
  );

  return toHex(derivedBits);
}

export async function verifyPin(
  pin: string,
  saltHex: string,
  expectedHash: string
): Promise<boolean> {
  const computedHash = await hashPin(pin, saltHex);
  return timingSafeEqual(computedHash, expectedHash);
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}
