import type { HiringListing } from '@prisma/client'
import { prisma } from '../../db/prisma'
import { BadRequestError, NotFoundError } from '../../errors/httpErrors'
import type { ListingInput } from './hiring.schema'

const monsterSelect = {
  select: {
    id: true,
    name: true,
    birthDate: true,
    temperament: true,
    quirks: true,
    status: true,
    species: { select: { id: true, name: true, slug: true, dangerLevel: true } },
  },
} as const

function toDto<T extends HiringListing>(l: T) {
  return {
    ...l,
    feeGold: Number(l.feeGold),
    skills: l.skills ? l.skills.split(',').filter(Boolean) : [],
  }
}

/**
 * The public Hiring Hall: open listings for monsters that are available now
 * and are not in the middle of a treatment.
 */
export async function publicListings() {
  const listings = await prisma.hiringListing.findMany({
    where: {
      status: 'OPEN',
      availableFrom: { lte: new Date() },
      monster: {
        status: { in: ['AVAILABLE', 'IN_RESIDENCE'] },
        medicalRecords: { none: { treatments: { some: { status: 'ONGOING' } } } },
      },
    },
    include: { monster: monsterSelect },
    orderBy: { availableFrom: 'asc' },
  })
  return listings.map(toDto)
}

/**
 * "Available soon": open listings whose available-from date is in the next
 * 30 days, so overlords can plan ahead (#44).
 */
export async function availableSoon() {
  const today = new Date()
  const in30Days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
  const listings = await prisma.hiringListing.findMany({
    where: { status: 'OPEN', availableFrom: { gt: today, lte: in30Days } },
    include: {
      monster: {
        select: { ...monsterSelect.select, stays: { where: { status: 'CHECKED_IN' }, select: { status: true, reason: true } } },
      },
    },
    orderBy: { availableFrom: 'asc' },
  })
  // don't advertise monsters that are still being patched up
  return listings.filter((l) => l.monster.stays.every((s) => s.status !== 'TREATMENT')).map(toDto)
}

/** All listings, including drafts, for staff. */
export async function allListings() {
  const listings = await prisma.hiringListing.findMany({
    include: { monster: monsterSelect },
    orderBy: [{ status: 'asc' }, { availableFrom: 'asc' }],
  })
  return listings.map(toDto)
}

export async function getListing(id: number, includeDrafts: boolean) {
  const listing = await prisma.hiringListing.findUnique({ where: { id }, include: { monster: monsterSelect } })
  if (!listing || (!includeDrafts && listing.status === 'DRAFT')) throw new NotFoundError('Listing')
  return toDto(listing)
}

export async function createListing(input: ListingInput, createdById: number) {
  const monster = await prisma.monster.findUnique({ where: { id: input.monsterId } })
  if (!monster) throw new NotFoundError('Monster')
  if (monster.status === 'HIRED' || monster.status === 'RETIRED') {
    throw new BadRequestError(`${monster.name} is ${monster.status.toLowerCase()} and can't be listed`)
  }
  const listing = await prisma.hiringListing.create({
    data: {
      ...input,
      skills: input.skills.join(','),
      availableFrom: new Date(input.availableFrom),
      createdById,
    },
  })
  return toDto(listing)
}

export async function setListingStatus(id: number, status: string) {
  const listing = await prisma.hiringListing.findUnique({ where: { id } })
  if (!listing) throw new NotFoundError('Listing')
  return toDto(await prisma.hiringListing.update({ where: { id }, data: { status } }))
}
