/**
 * Previene CSV/Formula Injection (CWE-1236): si un campo de texto libre
 * (ej. descripción de un gasto) empieza con =, +, -, @ o un tab/CR, Excel o
 * Sheets pueden interpretarlo como una fórmula al abrir el archivo
 * exportado. Se neutraliza anteponiendo un apóstrofe.
 */
const DANGEROUS_PREFIXES = ["=", "+", "-", "@", "\t", "\r"];

export function sanitizeForCsv(value: string): string {
  const stringValue = String(value);
  if (DANGEROUS_PREFIXES.some((prefix) => stringValue.startsWith(prefix))) {
    return `'${stringValue}`;
  }
  return stringValue;
}

export function toCsvField(value: string | number | boolean): string {
  const stringValue = sanitizeForCsv(String(value));
  const escaped = stringValue.replace(/"/g, '""');
  return `"${escaped}"`;
}

export function buildCsv(headers: string[], rows: (string | number | boolean)[][]): string {
  const headerLine = headers.map(toCsvField).join(",");
  const dataLines = rows.map((row) => row.map(toCsvField).join(","));
  return [headerLine, ...dataLines].join("\r\n");
}
