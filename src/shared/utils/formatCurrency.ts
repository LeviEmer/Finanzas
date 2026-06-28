export function formatCurrency(amount: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("es", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}
