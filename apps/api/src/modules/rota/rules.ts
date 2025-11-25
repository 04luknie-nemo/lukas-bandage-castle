// Can this person work this shift? Used when the rota is edited.
import { format } from 'date-fns'
import { MAX_HOURS_PER_WEEK, MIN_REST_HOURS, restBetween, totalHours, weekStart, type ShiftTimes } from './hours'

export type ExistingShift = ShiftTimes & { id: number }
export type Leave = { fromDate: Date; toDate: Date; status: string }

export function overlaps(a: ShiftTimes, b: ShiftTimes): boolean {
  return a.startsAt < b.endsAt && b.startsAt < a.endsAt
}

/** yyyy-mm-dd of a castle-time moment */
const dayOf = (d: Date) => format(d, 'yyyy-MM-dd')
/** DATE columns come back as UTC midnight */
const dateOnly = (d: Date) => d.toISOString().slice(0, 10)

export function onLeave(shift: ShiftTimes, leave: Leave[]): Leave | undefined {
  const day = dayOf(shift.startsAt)
  return leave.find((l) => l.status === 'APPROVED' && dateOnly(l.fromDate) <= day && day <= dateOnly(l.toDate))
}

/**
 * Everything wrong with giving `shift` to someone who already works `existing`
 * and has `leave`. Empty list = fine. Pass the person's shifts for at least
 * the week of the new shift (plus a day either side, for the rest rule).
 */
export function shiftProblems(shift: ShiftTimes & { id?: number }, existing: ExistingShift[], leave: Leave[]): string[] {
  const problems: string[] = []
  if (shift.endsAt <= shift.startsAt) problems.push('A shift has to end after it starts')

  const others = existing.filter((s) => s.id !== shift.id)
  const clash = others.find((s) => overlaps(shift, s))
  if (clash) problems.push(`Already working ${format(clash.startsAt, 'EEE HH:mm')}–${format(clash.endsAt, 'HH:mm')}`)

  if (onLeave(shift, leave)) problems.push('On leave that day')

  for (const s of others) {
    if (overlaps(shift, s)) continue
    const rest = s.endsAt <= shift.startsAt ? restBetween(s, shift) : restBetween(shift, s)
    if (rest < MIN_REST_HOURS) {
      problems.push(`Only ${Math.round(rest * 10) / 10} hours rest between shifts (minimum ${MIN_REST_HOURS})`)
      break
    }
  }

  const week = weekStart(shift.startsAt).getTime()
  const sameWeek = others.filter((s) => weekStart(s.startsAt).getTime() === week)
  const hours = totalHours([...sameWeek, shift])
  if (hours > MAX_HOURS_PER_WEEK) problems.push(`That makes ${hours} hours this week (maximum ${MAX_HOURS_PER_WEEK})`)

  return problems
}
