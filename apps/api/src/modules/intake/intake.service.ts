import { prisma } from '../../db/prisma'
import { BadRequestError, NotFoundError } from '../../errors/httpErrors'
import { sendRaven } from '../../legacy/ravenPost/ravenPost'
import type { IntakeInput } from './intake.schema'

// stays that are booked and start today or tomorrow (or are overdue)
export async function pendingArrivals() {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return prisma.stay.findMany({
    where: { status: 'BOOKED', startDate: { lte: tomorrow } },
    include: {
      monster: { select: { id: true, name: true, species: { select: { name: true } } } },
      customer: { select: { id: true, title: true, firstName: true, lastName: true } },
    },
    orderBy: { startDate: 'asc' },
  })
}

export async function getIntake(stayId: number) {
  const intake = await prisma.intakeForm.findUnique({ where: { stayId } })
  if (!intake) throw new NotFoundError('Intake form')
  return intake
}

export async function createIntake(data: IntakeInput, userId: number) {
  const stay = await prisma.stay.findUnique({ where: { id: data.stayId }, include: { monster: true } })
  if (!stay) throw new NotFoundError('Stay')
  if (stay.status !== 'BOOKED') throw new BadRequestError('This stay is not waiting for check-in')

  const intake = await prisma.$transaction(async (tx) => {
    const created = await tx.intakeForm.create({
      data: {
        stayId: stay.id,
        monsterId: stay.monsterId,
        conditionOnArrival: data.conditionOnArrival,
        weightKg: data.weightKg,
        injuries: data.injuries,
        behaviourNotes: data.behaviourNotes,
        belongings: data.belongings,
        receivedById: userId,
      },
    })
    await tx.stay.update({ where: { id: stay.id }, data: { status: 'CHECKED_IN', checkedInAt: new Date() } })
    await tx.monster.update({ where: { id: stay.monsterId }, data: { status: 'IN_RESIDENCE' } })
    return created
  })

  // TODO: switch to the new notifications when they exist
  sendRaven(stay.customerId, `${stay.monster.name} has arrived`, `${stay.monster.name} was checked in by our front desk. Condition on arrival: ${data.conditionOnArrival.toLowerCase()}.`)

  return intake
}
