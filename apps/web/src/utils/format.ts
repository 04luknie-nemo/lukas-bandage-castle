// Small display helpers.

/** dd/mm/yyyy, which is what the keepers asked for. */
export function formatShortDate(value: string | Date | null | undefined): string {
  if (!value) return ''
  const d = new Date(value)
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth()).padStart(2, '0')}/${d.getFullYear()}`
}

/** "3 days ago", "in 2 hours" etc. */
export function timeAgo(value: string | Date): string {
  const diff = Date.now() - new Date(value).getTime()
  const abs = Math.abs(diff)
  const units: [number, string][] = [
    [365 * 24 * 3600 * 1000, 'year'],
    [30 * 24 * 3600 * 1000, 'month'],
    [24 * 3600 * 1000, 'day'],
    [3600 * 1000, 'hour'],
    [60 * 1000, 'minute'],
  ]
  for (const [ms, name] of units) {
    if (abs >= ms) {
      const n = Math.floor(abs / ms)
      const label = `${n} ${name}${n === 1 ? '' : 's'}`
      return diff >= 0 ? `${label} ago` : `in ${label}`
    }
  }
  return 'just now'
}

export function userName(u: { displayName: string | null; email: string } | null | undefined): string {
  if (!u) return 'nobody'
  return u.displayName || u.email
}
