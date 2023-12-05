import type { Prisma } from '@prisma/client'
import { prisma } from '../../db/prisma'
import { BadRequestError, ConflictError, NotFoundError } from '../../errors/httpErrors'
import { sendRaven } from '../../legacy/ravenPost/ravenPost'
import type { CreateJobInput, JobStatus, ListQuery } from './courier.schema'
import { quote, tripMinutes } from './fees'
import { findClash, tripEnd } from './schedule'

// Which status can follow which. Scheduling goes through assignCourier().
const NEXT: Record<JobStatus, JobStatus[]> = {
  REQUESTED: ['CANCELLED'],
  SCHEDULED: ['IN_FLIGHT', 'REQUESTED', 'CANCELLED'],
  IN_FLIGHT: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
}

const BUSY: JobStatus[] = ['SCHEDULED', 'IN_FLIGHT']

function dayRange(date: string) {
  const [y, m, d] = date.split('-').map(Number)
  return { gte: new Date(y, m - 1, d), lt: new Date(y, m - 1, d + 1) }
}

/** Monster + customer names for a list of jobs (courier_jobs has no relations to them, see schema). */
async function withNames<T extends { monsterId: number; customerId: number }>(jobs: T[]) {
  const [monsters, customers] = await Promise.all([
    prisma.monster.findMany({ where: { id: { in: jobs.map((j) => j.monsterId) } }, select: { id: true, name: true } }),
    prisma.customer.findMany({ where: { id: { in: jobs.map((j) => j.customerId) } }, select: { id: true, title: true, lastName: true } }),
  ])
  return jobs.map((j) => {
    const c = customers.find((x) => x.id === j.customerId)
    return {
      ...j,
      monsterName: monsters.find((m) => m.id === j.monsterId)?.name ?? '?',
      customerName: c ? `${c.title ?? ''} ${c.lastName ?? ''}`.trim() : '?',
    }
  })
}

export async function listCouriers() {
  return prisma.courier.findMany({ orderBy: [{ active: 'desc' }, { name: 'asc' }] })
}

export async function listJobs(query: ListQuery) {
  const where: Prisma.CourierJobWhereInput = {}
  if (query.date) where.scheduledFor = dayRange(query.date)
  if (query.status) where.status = query.status
  const jobs = await prisma.courierJob.findMany({
    where,
    include: { courier: { select: { id: true, name: true, kind: true } } },
    orderBy: { scheduledFor: 'asc' },
    take: 200,
  })
  return withNames(jobs)
}

export async function getJob(id: number) {
  const job = await prisma.courierJob.findUnique({ where: { id }, include: { courier: true } })
  if (!job) throw new NotFoundError('Courier job')
  return (await withNames([job]))[0]
}

export async function createJob(input: CreateJobInput, userId: number) {
  const monster = await prisma.monster.findUnique({ where: { id: input.monsterId }, include: { owner: true } })
  if (!monster) throw new NotFoundError('Monster')
  if (!monster.owner) throw new BadRequestError(`${monster.name} belongs to the castle, there is no lair to fly to`)

  const address = input.address || monster.owner.lairAddress
  if (!address) throw new BadRequestError('No lair address on file. Please add one.')

  const scheduledFor = new Date(input.scheduledFor)
  const fee = quote({ ...input, scheduledFor })

  return prisma.courierJob.create({
    data: {
      stayId: input.stayId ?? null,
      monsterId: monster.id,
      customerId: monster.owner.id,
      direction: input.direction,
      address,
      distanceLeagues: input.distanceLeagues,
      weightKg: input.weightKg,
      scheduledFor,
      durationMin: tripMinutes(input.distanceLeagues),
      fee: fee.total,
      notes: input.notes,
      createdById: userId,
    },
  })
}

export async function assignCourier(id: number, courierId: number) {
  const job = await prisma.courierJob.findUnique({ where: { id } })
  if (!job) throw new NotFoundError('Courier job')
  if (job.status === 'DELIVERED' || job.status === 'CANCELLED') throw new BadRequestError(`This trip is ${job.status.toLowerCase()}`)

  const courier = await prisma.courier.findUnique({ where: { id: courierId } })
  if (!courier) throw new NotFoundError('Courier')
  if (!courier.active) throw new BadRequestError(`${courier.name} is not flying at the moment`)
  if (job.weightKg > courier.maxLoadKg) {
    throw new BadRequestError(`${courier.name} can carry ${courier.maxLoadKg} kg, this monster weighs ${job.weightKg} kg`)
  }

  // the courier's other trips around that day (a night flight can start the evening before)
  const trip = { id: job.id, scheduledFor: job.scheduledFor, durationMin: tripMinutes(Number(job.distanceLeagues), courier.speed) }
  const others = await prisma.courierJob.findMany({
    where: {
      courierId,
      status: { in: BUSY },
      scheduledFor: { gte: new Date(job.scheduledFor.getTime() - 24 * 3600 * 1000), lt: new Date(job.scheduledFor.getTime() + 24 * 3600 * 1000) },
    },
  })
  const clash = findClash(trip, others)
  if (clash) {
    const until = tripEnd(clash).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
    throw new ConflictError(`${courier.name} is out on trip #${clash.id} until ${until}`)
  }

  const updated = await prisma.courierJob.update({
    where: { id },
    data: { courierId, status: 'SCHEDULED', durationMin: trip.durationMin },
    include: { courier: true },
  })

  const monster = await prisma.monster.findUnique({ where: { id: job.monsterId }, select: { name: true } })
  const name = monster?.name ?? 'Your monster'
  const when = job.scheduledFor.toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })
  const kind = courier.kind.toLowerCase().replace('_', ' ')
  if (job.direction === 'PICKUP') {
    sendRaven(job.customerId, `${courier.name} is coming for ${name}`, `Our ${kind} ${courier.name} will collect ${name} from your lair on ${when}. Please have the monster ready and the drawbridge down.`)
  } else {
    sendRaven(job.customerId, `${name} is flying home`, `${name} will be delivered to your lair by ${courier.name} on ${when}. Somebody needs to be home to sign.`)
  }
  return updated
}

export async function setStatus(id: number, status: JobStatus) {
  const job = await prisma.courierJob.findUnique({ where: { id } })
  if (!job) throw new NotFoundError('Courier job')
  const current = job.status as JobStatus
  if (!NEXT[current].includes(status)) throw new BadRequestError(`Can't go from ${current} to ${status}`)

  return prisma.courierJob.update({
    where: { id },
    data: {
      status,
      courierId: status === 'REQUESTED' ? null : undefined,
      deliveredAt: status === 'DELIVERED' ? new Date() : undefined,
    },
  })
}

/** Everything one day's couriers need to know, grouped per courier. Cancelled trips are left out. */
export async function routeSheet(date: string) {
  const jobs = await listJobs({ date })
  const live = jobs.filter((j) => j.status !== 'CANCELLED')
  const couriers = await prisma.courier.findMany({ where: { id: { in: live.map((j) => j.courierId).filter((id): id is number => id !== null) } } })

  return {
    date,
    couriers: couriers.map((c) => {
      const mine = live.filter((j) => j.courierId === c.id)
      return {
        courier: c,
        pickups: mine.filter((j) => j.direction === 'PICKUP'),
        returns: mine.filter((j) => j.direction === 'RETURN'),
        minutesAway: mine.reduce((sum, j) => sum + j.durationMin, 0),
      }
    }),
    unassigned: live.filter((j) => j.courierId === null),
  }
}
