// Wyvern courier: the couriers and two months of trips around today.
import type { PrismaClient } from '@prisma/client'
import { TODAY, type Rng } from './random'
import type { SeededStay } from './stays'
import type { World } from './world'

const COURIERS = [
  { name: 'Skyrender', kind: 'WYVERN', maxLoadKg: 900, speed: 30, active: true, notes: 'Our best flyer. Refuses to land in mud.' },
  { name: 'Old Featherbottom', kind: 'GRIFFIN', maxLoadKg: 400, speed: 25, active: true, notes: 'Gentle with nervous passengers.' },
  { name: 'The Swarm', kind: 'BAT_SWARM', maxLoadKg: 40, speed: 35, active: true, notes: 'Several hundred bats. Counts as one courier. Night flights preferred.' },
  { name: 'Bessie', kind: 'CART', maxLoadKg: 3000, speed: 6, active: true, notes: 'Pulled by an ogre called Doug. Doug does not fly.' },
  { name: 'Cinderwing', kind: 'WYVERN', maxLoadKg: 1200, speed: 28, active: false, notes: 'Grounded: singed her own wing sneezing.' },
] as const

// rough weights, kg
const WEIGHT: Record<string, number> = {
  banshee: 1, wraith: 1, imp: 6, cockatrice: 9, kobold: 25, goblin: 35, hobgoblin: 70, harpy: 45, basilisk: 120,
  werewolf: 95, ghoul: 70, 'giant-spider': 150, slime: 60, yeti: 280, gargoyle: 320, griffin: 260, troll: 380,
  sphinx: 450, ogre: 420, minotaur: 520, manticore: 480, chimera: 600, golem: 700, cyclops: 650, gorgon: 90,
  wyvern: 600, dragon: 820, hydra: 1400, 'sea-serpent': 1900, kraken: 2600,
}

const TIMES: [number, number][] = [[8, 0], [8, 30], [9, 0], [9, 30], [10, 0], [11, 0], [11, 30], [13, 0], [14, 0], [15, 30], [16, 0]]

// same prices as apps/api/src/modules/courier/fees.ts
function fee(leagues: number, kg: number, hour: number) {
  const r = (n: number) => Math.round(n * 100) / 100
  const distance = r(leagues * 1.5)
  const heavy = kg > 500 ? r((5 + distance) * 0.5) : 0
  const night = hour >= 20 || hour < 6 ? 10 : 0
  return r(5 + distance + heavy + night)
}
function minutes(leagues: number, speed: number) {
  return Math.ceil(((leagues * 2) / speed) * 60 / 5) * 5 + 30
}
function local(n: number, h: number, m = 0) {
  return new Date(TODAY.getUTCFullYear(), TODAY.getUTCMonth(), TODAY.getUTCDate() + n, h, m)
}

type Courier = { id: number; name: string; maxLoadKg: number; speed: number; active: boolean }
type Booked = { courierId: number; start: number; end: number }

export async function seedCourier(prisma: PrismaClient, rng: Rng, world: World, stays: SeededStay[]) {
  const couriers: Courier[] = []
  for (const c of COURIERS) couriers.push(await prisma.courier.create({ data: { ...c, createdAt: new Date('2023-10-18T09:00:00Z') } }))
  const byName = (name: string) => couriers.find((c) => c.name === name)!

  const addresses = new Map((await prisma.customer.findMany({ select: { id: true, lairAddress: true } })).map((c) => [c.id, c.lairAddress ?? 'The lair']))
  const busy: Booked[] = []
  const free = (courierId: number, start: Date, mins: number) =>
    !busy.some((b) => b.courierId === courierId && start.getTime() < b.end && b.start < start.getTime() + mins * 60000)

  let count = 0
  async function trip(s: SeededStay, direction: 'PICKUP' | 'RETURN', day: number, time: [number, number], opts: { courier?: Courier | null; status?: string; leagues?: number; notes?: string } = {}) {
    const kg = WEIGHT[s.monster.species.slug] ?? 60
    const leagues = opts.leagues ?? rng.int(4, 36)
    const when = local(day, time[0], time[1])
    let courier = opts.courier
    if (courier === undefined) {
      const fits = couriers.filter((c) => c.active && c.maxLoadKg >= kg && c.speed > 10)
      courier = fits.length ? fits.sort((a, b) => a.maxLoadKg - b.maxLoadKg)[0] : byName('Bessie')
    }
    const mins = minutes(leagues, courier?.speed ?? 20)
    let status = opts.status ?? (day < 0 ? 'DELIVERED' : day === 0 ? 'SCHEDULED' : rng.chance(0.6) ? 'SCHEDULED' : 'REQUESTED')
    if (status !== 'REQUESTED' && status !== 'CANCELLED' && courier && !free(courier.id, when, mins)) status = day < 0 ? 'CANCELLED' : 'REQUESTED'
    const assigned = status === 'REQUESTED' ? null : courier
    if (assigned && status !== 'CANCELLED') busy.push({ courierId: assigned.id, start: when.getTime(), end: when.getTime() + mins * 60000 })

    await prisma.courierJob.create({
      data: {
        stayId: s.id,
        monsterId: s.monster.id,
        customerId: s.customerId,
        direction,
        address: addresses.get(s.customerId) ?? 'The lair',
        distanceLeagues: leagues,
        weightKg: kg,
        scheduledFor: when,
        durationMin: mins,
        courierId: assigned?.id ?? null,
        status,
        fee: fee(leagues, kg, time[0]),
        notes: opts.notes ?? (rng.chance(0.25) ? rng.pick(['Sedate before take-off.', 'Hates thunder.', 'Bring the big harness.', 'Owner insists on a blanket.', 'Gets airsick. Bucket.']) : null),
        createdById: world.users.frontdesk.id,
        createdAt: local(Math.min(day, 0) - rng.int(1, 6), 10),
        deliveredAt: status === 'DELIVERED' ? new Date(when.getTime() + mins * 60000) : null,
      },
    })
    count++
  }

  const owned = stays.filter((s) => s.customerId !== world.houseCustomerId && s.reason !== 'SURRENDER')
  const reserved = new Set<number>()

  // --- fixtures ----------------------------------------------------------------

  // Sir Snortlewick always flies with Skyrender, sedated (swords on the way)
  const winter = owned.find((s) => s.monster.key === 'snortlewick' && s.status === 'CHECKED_OUT')!
  await trip(winter, 'PICKUP', winter.start, [10, 0], { courier: byName('Skyrender'), status: 'DELIVERED', leagues: 14, notes: 'Sedated. No swords on the route!' })
  await trip(winter, 'RETURN', winter.checkout!, [11, 0], { courier: byName('Skyrender'), status: 'DELIVERED', leagues: 14, notes: 'Sedated. No swords on the route!' })
  reserved.add(winter.id)
  const current = owned.find((s) => s.monster.key === 'snortlewick' && s.status === 'CHECKED_IN')!
  await trip(current, 'PICKUP', current.start, [10, 0], { courier: byName('Skyrender'), status: 'DELIVERED', leagues: 14, notes: 'Sedated. No swords on the route!' })
  await trip(current, 'RETURN', current.pickup!, [11, 0], { courier: byName('Skyrender'), status: 'SCHEDULED', leagues: 14, notes: 'Sedated. No swords on the route!' })
  reserved.add(current.id)

  // a busy day for Old Featherbottom in the coming week
  const light = (s: SeededStay) => (WEIGHT[s.monster.species.slug] ?? 60) <= 400
  const goingHome = (d: number) => owned.filter((s) => s.status === 'CHECKED_IN' && s.pickup === d && light(s) && !reserved.has(s.id))
  const busyDay = [1, 2, 3, 4, 5, 6, 7].find((d) => goingHome(d).length >= 3) ?? 2
  const [early, late, unplanned] = goingHome(busyDay)
  const featherbottom = byName('Old Featherbottom')
  if (early && late && unplanned) {
    await trip(early, 'RETURN', busyDay, [8, 30], { courier: featherbottom, status: 'SCHEDULED', leagues: 4 })
    await trip(late, 'RETURN', busyDay, [11, 0], { courier: featherbottom, status: 'SCHEDULED', leagues: 12 })
    await trip(unplanned, 'RETURN', busyDay, [10, 0], { courier: null, status: 'REQUESTED', leagues: 12, notes: 'Owner asked for the griffin.' })
    for (const s of [early, late, unplanned]) reserved.add(s.id)
  }

  // --- everyday trips ------------------------------------------------------------
  for (const s of owned) {
    if (reserved.has(s.id) || s.status === 'CANCELLED') continue
    if (s.start >= -90 && s.start <= 21 && s.start !== busyDay && rng.chance(0.7)) await trip(s, 'PICKUP', s.start, rng.pick(TIMES))
    const home = s.checkout ?? s.pickup
    if (home !== null && home >= -90 && home <= 21 && home !== busyDay && rng.chance(0.7)) await trip(s, 'RETURN', home, rng.pick(TIMES))
  }
  // one evening run for The Swarm
  const tiny = owned.find((s) => s.status === 'BOOKED' && s.start !== busyDay && (WEIGHT[s.monster.species.slug] ?? 60) <= 40 && !reserved.has(s.id))
  if (tiny) await trip(tiny, 'PICKUP', tiny.start, [21, 0], { courier: byName('The Swarm'), status: 'SCHEDULED', leagues: 8, notes: 'Night flight, the bats insist.' })

  return { couriers: couriers.length, trips: count, busyDay }
}
