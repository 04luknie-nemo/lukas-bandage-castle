// Is the castle covered? Minimum staffing per day, as agreed in November 2025.
import { format } from 'date-fns'

export type CoverageShift = { startsAt: Date; post: string }

type Need = { post: string; min: number; label: string; days?: number[] }

// days: 0 = Sunday ... 6 = Saturday (Date.getDay)
export const NEEDS: Need[] = [
  { post: 'KEEPER', min: 2, label: 'keepers (early + late)' },
  { post: 'NIGHT_WATCH', min: 1, label: 'night watch' },
  { post: 'VET', min: 1, label: 'vet', days: [1, 2, 3, 4, 5] },
  { post: 'FRONT_DESK', min: 1, label: 'front desk', days: [1, 2, 3, 4, 5, 6] },
]

export type Gap = { day: string; post: string; label: string; have: number; need: number }

/** Missing cover for each day. A shift counts for the day it starts. */
export function coverageGaps(days: Date[], shifts: CoverageShift[]): Gap[] {
  const gaps: Gap[] = []
  for (const d of days) {
    const day = format(d, 'yyyy-MM-dd')
    const todays = shifts.filter((s) => format(s.startsAt, 'yyyy-MM-dd') === day)
    for (const need of NEEDS) {
      if (need.days && !need.days.includes(d.getDay())) continue
      const have = todays.filter((s) => s.post === need.post).length
      if (have < need.min) gaps.push({ day, post: need.post, label: need.label, have, need: need.min })
    }
  }
  return gaps
}
