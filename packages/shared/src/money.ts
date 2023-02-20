/**
 * Format an amount of gold pieces for display: 1234.5 -> "1,234.50 gp".
 */
export function toGoldString(gp: number | string | null | undefined): string {
  const n = Number(gp ?? 0)
  return `${n.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} gp`
}
