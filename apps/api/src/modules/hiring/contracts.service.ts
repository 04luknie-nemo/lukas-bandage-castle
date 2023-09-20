import { prisma } from '../../db/prisma'
import { BadRequestError, ForbiddenError, NotFoundError } from '../../errors/httpErrors'

const include = {
  application: { include: { listing: { select: { id: true, title: true, monster: { select: { id: true, name: true } } } } } },
}

/** Staff see every contract, overlords only their own. */
export async function listContracts(customerId?: number) {
  return prisma.hireContract.findMany({
    where: customerId === undefined ? undefined : { customerId },
    include,
    orderBy: { createdAt: 'desc' },
  })
}

export async function signContract(id: number, customerId: number | null) {
  const contract = await prisma.hireContract.findUnique({ where: { id }, include })
  if (!contract) throw new NotFoundError('Contract')
  if (contract.customerId !== customerId) throw new ForbiddenError('This is not your contract')
  if (contract.signedAt) throw new BadRequestError('Already signed')

  return prisma.$transaction(async (tx) => {
    const signed = await tx.hireContract.update({ where: { id }, data: { signedAt: new Date() }, include })
    await tx.monster.update({ where: { id: contract.monsterId }, data: { status: 'HIRED' } })
    await tx.hiringListing.update({ where: { id: contract.application.listing.id }, data: { status: 'CLOSED' } })
    return signed
  })
}
