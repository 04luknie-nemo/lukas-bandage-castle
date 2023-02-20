/** Age in whole years. Moved here from legacy/lib/dates.ts so the web app can use it too. */
export function ageInYears(birthDate: string | Date | null | undefined, today: Date = new Date()): number | null {
  if (!birthDate) return null
  return today.getFullYear() - new Date(birthDate).getFullYear()
}

/** "2023-02-20" for a Date, using the calendar day in UTC. */
export function toDateOnly(d: Date): string {
  return d.toISOString().slice(0, 10)
}
