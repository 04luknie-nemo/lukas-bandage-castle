// The staff rota: four weeks back, four weeks ahead, plus some time off and a swap.
import type { PrismaClient } from '@prisma/client'
import { TODAY, type Rng } from './random'
import type { World } from './world'

type Post = 'KEEPER' | 'NIGHT_WATCH' | 'VET' | 'FRONT_DESK' | 'THERAPIST'
// [person, weekday (0 = Monday), from, to, post]. A "to" before "from" ends the next morning.
type Slot = [string, number, number, number, Post]

// The usual week, as pinned up in the staff room.
const USUAL_WEEK: Slot[] = [
  ...[0, 1, 2, 3].map((d): Slot => ['keeper', d, 7, 15, 'KEEPER']),
  ['keeper', 4, 22, 6, 'NIGHT_WATCH'],
  ['keeper', 5, 22, 6, 'NIGHT_WATCH'],
  ...[0, 1, 2].map((d): Slot => ['keeper2', d, 14, 22, 'KEEPER']),
  ...[4, 5, 6].map((d): Slot => ['keeper2', d, 7, 15, 'KEEPER']),
  ...[0, 1, 2].map((d): Slot => ['igor', d, 22, 6, 'NIGHT_WATCH']),
  ['igor', 4, 14, 22, 'KEEPER'],
  ['igor', 5, 14, 22, 'KEEPER'],
  ...[0, 1, 2, 3, 4].map((d): Slot => ['vet', d, 8, 16, 'VET']),
  ...[0, 1, 2, 3, 4].map((d): Slot => ['frontdesk', d, 9, 17, 'FRONT_DESK']),
  ['frontdesk', 5, 9, 13, 'FRONT_DESK'],
  ...[1, 2, 3].map((d): Slot => ['therapist', d, 10, 18, 'THERAPIST']),
]

const AREAS: Record<Post, string[]> = {
  KEEPER: ['Ember Vault', 'North Tower', 'Bog Wing', 'Bat Loft', 'Crypt Level', 'Moat'],
  NIGHT_WATCH: ['Battlements', 'Whole castle'],
  VET: ['Infirmary'],
  FRONT_DESK: ['Front desk'],
  THERAPIST: ['The Quiet Room'],
}

/** Castle-time moment: day n from today (local calendar), hh:mm. */
function local(n: number, hours: number, minutes = 0) {
  return new Date(TODAY.getUTCFullYear(), TODAY.getUTCMonth(), TODAY.getUTCDate() + n, hours, minutes)
}

/** UTC midnight of day n, for DATE columns */
function dateOnly(n: number) {
  return new Date(Date.UTC(TODAY.getUTCFullYear(), TODAY.getUTCMonth(), TODAY.getUTCDate() + n))
}

export async function seedRota(prisma: PrismaClient, rng: Rng, world: World) {
  const u = world.users
  const weekday = (local(0, 12).getDay() + 6) % 7 // 0 = Monday
  const monday = -weekday // day offset of this week's Monday

  // Ingrid is at the Dragon Dentistry Congress on Wednesday and Thursday next week
  const congress = [monday + 9, monday + 10]

  let shifts = 0
  const ids = new Map<string, number>()
  for (let week = -4; week <= 4; week++) {
    for (const [who, d, from, to, post] of USUAL_WEEK) {
      const n = monday + week * 7 + d
      if (who === 'vet' && congress.includes(n)) continue
      const startsAt = local(n, from)
      const endsAt = to > from ? local(n, to) : local(n + 1, to)
      const created = await prisma.shift.create({
        data: { userId: u[who].id, startsAt, endsAt, post, area: rng.pick(AREAS[post]), createdById: u.admin.id, createdAt: local(n - 14, 16) },
      })
      ids.set(`${who}:${n}:${from}`, created.id)
      shifts++
    }
  }

  await prisma.timeOff.createMany({
    data: [
      { userId: u.vet.id, fromDate: dateOnly(congress[0]), toDate: dateOnly(congress[1]), reason: 'Dragon Dentistry Congress, Wyrmhold', status: 'APPROVED', decidedById: u.admin.id },
      { userId: u.keeper2.id, fromDate: dateOnly(monday - 18), toDate: dateOnly(monday - 16), reason: 'Sister\'s wedding (in the bog)', status: 'APPROVED', decidedById: u.admin.id },
      { userId: u.igor.id, fromDate: dateOnly(monday + 15), toDate: dateOnly(monday + 16), reason: 'Master needs help with an experiment', status: 'REQUESTED' },
      { userId: u.frontdesk.id, fromDate: dateOnly(monday + 25), toDate: dateOnly(monday + 27), reason: null, status: 'REQUESTED' },
      { userId: u.keeper.id, fromDate: dateOnly(monday - 25), toDate: dateOnly(monday - 25), reason: 'Gout', status: 'REJECTED', decidedById: u.admin.id },
    ],
  })

  // Bryony wants next Wednesday's late shift off and asked Old Hobb to take it.
  const wednesdayLate = ids.get(`keeper2:${monday + 9}:14`)!
  await prisma.shiftSwap.create({
    data: { shiftId: wednesdayLate, fromUserId: u.keeper2.id, toUserId: u.keeper.id, message: 'Mum is visiting from the marsh, please!!', createdAt: local(-1, 18, 12) },
  })
  // an old one that went fine
  const pastLate = ids.get(`keeper2:${monday - 7}:14`)!
  await prisma.shiftSwap.create({
    data: { shiftId: pastLate, fromUserId: u.keeper2.id, toUserId: u.igor.id, status: 'DECLINED', message: 'Can you do Monday?', createdAt: local(-12, 9), decidedAt: local(-12, 11) },
  })

  return shifts
}
