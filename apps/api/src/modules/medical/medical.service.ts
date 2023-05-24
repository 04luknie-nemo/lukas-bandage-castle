import { prisma } from '../../db/prisma'
import { NotFoundError } from '../../errors/httpErrors'
import type { RecordInput, TreatmentInput } from './medical.schema'

const recordInclude = {
  treatments: { orderBy: { id: 'asc' } },
} as const

/**
 * Patients for the vet dashboard: monsters checked in for treatment, plus
 * anyone with an ongoing treatment (e.g. a boarder who got a cold).
 */
export async function listPatients() {
  const monsters = await prisma.monster.findMany({
    where: {
      OR: [
        { stays: { some: { status: 'CHECKED_IN', reason: 'TREATMENT' } } },
        { medicalRecords: { some: { treatments: { some: { status: 'ONGOING' } } } } },
      ],
    },
    include: {
      species: { select: { name: true } },
      medicalRecords: { include: recordInclude, orderBy: { visitDate: 'desc' } },
    },
    orderBy: { name: 'asc' },
  })
  return monsters.map((m) => ({
    id: m.id,
    name: m.name,
    species: m.species?.name ?? m.speciesName,
    records: m.medicalRecords,
  }))
}

export async function recordsForMonster(monsterId: number) {
  const monster = await prisma.monster.findUnique({ where: { id: monsterId }, select: { id: true, name: true } })
  if (!monster) throw new NotFoundError('Monster')
  const records = await prisma.medicalRecord.findMany({
    where: { monsterId },
    include: recordInclude,
    orderBy: { visitDate: 'desc' },
  })
  return { monster, records }
}

export async function createRecord(monsterId: number, vetId: number, input: RecordInput) {
  const monster = await prisma.monster.findUnique({ where: { id: monsterId } })
  if (!monster) throw new NotFoundError('Monster')
  return prisma.medicalRecord.create({
    data: { ...input, visitDate: new Date(input.visitDate), monsterId, vetId },
    include: recordInclude,
  })
}

export async function addTreatment(recordId: number, input: TreatmentInput) {
  const record = await prisma.medicalRecord.findUnique({ where: { id: recordId } })
  if (!record) throw new NotFoundError('Medical record')
  return prisma.treatment.create({
    data: {
      recordId,
      name: input.name,
      status: input.status,
      startedAt: input.startedAt ? new Date(input.startedAt) : input.status === 'ONGOING' ? new Date() : null,
      notes: input.notes,
    },
  })
}

export async function setTreatmentStatus(treatmentId: number, status: string) {
  const treatment = await prisma.treatment.findUnique({ where: { id: treatmentId } })
  if (!treatment) throw new NotFoundError('Treatment')
  return prisma.treatment.update({
    where: { id: treatmentId },
    data: {
      status,
      startedAt: status === 'ONGOING' && !treatment.startedAt ? new Date() : treatment.startedAt,
      endedAt: status === 'COMPLETE' ? new Date() : null,
    },
  })
}
