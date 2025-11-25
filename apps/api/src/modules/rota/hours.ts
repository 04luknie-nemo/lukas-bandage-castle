// Working time rules for the rota. Agreed with Castellan Brumhilde, November 2025.
import { startOfWeek } from 'date-fns'

/** The Castle Working Time Charter, §3 */
export const MAX_HOURS_PER_WEEK = 48
/** §4: at least this long between the end of one shift and the start of the next */
export const MIN_REST_HOURS = 11

export type ShiftTimes = { startsAt: Date; endsAt: Date }

/** Length of a shift in hours, e.g. 07:00–15:30 is 8.5 */
export function shiftHours(s: ShiftTimes): number {
  return s.endsAt.getHours() - s.startsAt.getHours() + (s.endsAt.getMinutes() - s.startsAt.getMinutes()) / 60
}

export function totalHours(shifts: ShiftTimes[]): number {
  return shifts.reduce((sum, s) => sum + shiftHours(s), 0)
}

/** Rota weeks start on Monday. */
export function weekStart(d: Date): Date {
  return startOfWeek(d, { weekStartsOn: 1 })
}

/** Hours of rest between two shifts, in order. */
export function restBetween(earlier: ShiftTimes, later: ShiftTimes): number {
  return (later.startsAt.getTime() - earlier.endsAt.getTime()) / (60 * 60 * 1000)
}
