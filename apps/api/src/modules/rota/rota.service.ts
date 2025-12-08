import { addDays, format, parseISO } from 'date-fns'
import { prisma } from '../../db/prisma'
import { ConflictError, NotFoundError } from '../../errors/httpErrors'
import * as audit from '../audit/audit.service'
import { coverageGaps } from './coverage'
import { totalHours, weekStart } from './hours'
import { shiftProblems } from './rules'
import type { LeaveInput, ShiftInput } from './rota.schema'

/** Roles that work shifts. Admins and scribes keep office hours. */
export const ROTA_ROLES = ['KEEPER', 'VET', 'FRONT_DESK', 'THERAPIST', 'STAFF']

export async function staff() {
  const users = await prisma.user.findMany({
    where: { roles: { some: { role: { in: ROTA_ROLES } } } },
    select: { id: true, displayName: true, email: true, roles: { select: { role: true } } },
    orderBy: { displayName: 'asc' },
  })
  return users.map((u) => ({ id: u.id, name: u.displayName ?? u.email, roles: u.roles.map((r) => r.role) }))
}

/** The rota for the week that contains `start` (Monday to Sunday). */
export async function week(start?: string) {
  const from = weekStart(start ? parseISO(start) : new Date())
  const to = addDays(from, 7)
  const days = Array.from({ length: 7 }, (_, i) => addDays(from, i))

  const [people, shifts, leave] = await Promise.all([
    staff(),
    prisma.shift.findMany({ where: { startsAt: { gte: from, lt: to } }, orderBy: { startsAt: 'asc' } }),
    prisma.timeOff.findMany({ where: { fromDate: { lt: to }, toDate: { gte: addDays(from, -1) }, status: { not: 'REJECTED' } } }),
  ])

  return {
    start: format(from, 'yyyy-MM-dd'),
    days: days.map((d) => format(d, 'yyyy-MM-dd')),
    people: people.map((p) => {
      const mine = shifts.filter((s) => s.userId === p.id)
      return { ...p, shifts: mine, hours: totalHours(mine), leave: leave.filter((l) => l.userId === p.id) }
    }),
    gaps: coverageGaps(days, shifts),
  }
}

/** Shifts and leave for one person, for the problem checks. */
async function contextFor(userId: number, around: Date) {
  const [existing, leave] = await Promise.all([
    prisma.shift.findMany({ where: { userId, startsAt: { gte: addDays(weekStart(around), -1), lt: addDays(weekStart(around), 8) } } }),
    prisma.timeOff.findMany({ where: { userId, status: 'APPROVED' } }),
  ])
  return { existing, leave }
}

function times(input: Pick<ShiftInput, 'startsAt' | 'endsAt'>) {
  return { startsAt: new Date(input.startsAt), endsAt: new Date(input.endsAt) }
}

export async function createShift(input: ShiftInput, actorId: number) {
  const shift = { ...input, ...times(input) }
  const { existing, leave } = await contextFor(input.userId, shift.startsAt)
  const problems = shiftProblems(shift, existing, leave)
  if (problems.length) throw new ConflictError(problems.join('. '))

  const created = await prisma.shift.create({ data: { ...shift, createdById: actorId } })
  await audit.record({ actorId, entity: 'shift', entityId: created.id, action: 'CREATE', after: created })
  return created
}

export async function updateShift(id: number, input: ShiftInput, actorId: number) {
  const before = await prisma.shift.findUnique({ where: { id } })
  if (!before) throw new NotFoundError('Shift')
  const shift = { ...input, ...times(input) }
  const { existing, leave } = await contextFor(input.userId, shift.startsAt)
  const problems = shiftProblems({ ...shift, id }, existing, leave)
  if (problems.length) throw new ConflictError(problems.join('. '))

  const after = await prisma.shift.update({ where: { id }, data: shift })
  await audit.record({ actorId, entity: 'shift', entityId: id, action: 'UPDATE', ...audit.diff(before, after) })
  return after
}

export async function deleteShift(id: number, actorId: number) {
  const before = await prisma.shift.findUnique({ where: { id } })
  if (!before) throw new NotFoundError('Shift')
  await prisma.shift.delete({ where: { id } })
  await audit.record({ actorId, entity: 'shift', entityId: id, action: 'DELETE', before })
}

export async function requestLeave(userId: number, input: LeaveInput) {
  return prisma.timeOff.create({ data: { userId, fromDate: new Date(input.fromDate), toDate: new Date(input.toDate), reason: input.reason } })
}

export async function decideLeave(id: number, status: 'APPROVED' | 'REJECTED', actorId: number) {
  const leave = await prisma.timeOff.findUnique({ where: { id } })
  if (!leave) throw new NotFoundError('Time off')
  const updated = await prisma.timeOff.update({ where: { id }, data: { status, decidedById: actorId } })
  await audit.record({ actorId, entity: 'time_off', entityId: id, action: status, after: updated })
  return updated
}

export async function pendingLeave() {
  const leave = await prisma.timeOff.findMany({ where: { status: 'REQUESTED' }, orderBy: { fromDate: 'asc' } })
  const people = await staff()
  return leave.map((l) => ({ ...l, name: people.find((p) => p.id === l.userId)?.name ?? '?' }))
}

/** My next four weeks. */
export async function mine(userId: number) {
  const today = new Date(new Date().setHours(0, 0, 0, 0))
  const [shifts, leave] = await Promise.all([
    prisma.shift.findMany({ where: { userId, startsAt: { gte: today, lt: addDays(today, 28) } }, orderBy: { startsAt: 'asc' } }),
    prisma.timeOff.findMany({ where: { userId, toDate: { gte: addDays(today, -1) } }, orderBy: { fromDate: 'asc' } }),
  ])
  return { shifts, leave }
}
