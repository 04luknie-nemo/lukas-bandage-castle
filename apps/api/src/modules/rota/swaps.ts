// Shift swaps: offer one of your shifts to a colleague, they accept or decline.
import { prisma } from '../../db/prisma'
import { BadRequestError, ForbiddenError, NotFoundError } from '../../errors/httpErrors'
import { NotificationService } from '../notifications/notification.service'
import * as audit from '../audit/audit.service'

export async function offerSwap(shiftId: number, fromUserId: number, toUserId: number, message?: string) {
  const shift = await prisma.shift.findUnique({ where: { id: shiftId } })
  if (!shift) throw new NotFoundError('Shift')
  if (shift.userId !== fromUserId) throw new ForbiddenError('You can only swap your own shifts')
  if (toUserId === fromUserId) throw new BadRequestError('Pick a colleague, not yourself')
  if (shift.startsAt < new Date()) throw new BadRequestError('That shift has already started')

  const open = await prisma.shiftSwap.findFirst({ where: { shiftId, status: 'PENDING' } })
  if (open) throw new BadRequestError('There is already an open swap for this shift')

  const swap = await prisma.shiftSwap.create({ data: { shiftId, fromUserId, toUserId, message } })
  const from = await prisma.user.findUnique({ where: { id: fromUserId }, select: { displayName: true } })
  await NotificationService.notifyUser(toUserId, 'Can you take a shift?', `${from?.displayName ?? 'A colleague'} asks if you can take their shift on ${shift.startsAt.toLocaleString('en-GB', { weekday: 'long', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}.`, '/rota/mine')
  return swap
}

async function openSwapFor(id: number, userId: number) {
  const swap = await prisma.shiftSwap.findUnique({ where: { id }, include: { shift: true } })
  if (!swap || swap.toUserId !== userId) throw new NotFoundError('Swap')
  if (swap.status !== 'PENDING') throw new BadRequestError(`This swap is already ${swap.status.toLowerCase()}`)
  return swap
}

export async function acceptSwap(id: number, userId: number) {
  const swap = await openSwapFor(id, userId)
  const [updated] = await prisma.$transaction([
    prisma.shiftSwap.update({ where: { id }, data: { status: 'ACCEPTED', decidedAt: new Date() } }),
    prisma.shift.update({ where: { id: swap.shiftId }, data: { userId } }),
    // any other open offers for this shift are moot now
    prisma.shiftSwap.updateMany({ where: { shiftId: swap.shiftId, status: 'PENDING', id: { not: id } }, data: { status: 'CANCELLED' } }),
  ])
  await audit.record({ actorId: userId, entity: 'shift', entityId: swap.shiftId, action: 'SWAP', before: { userId: swap.fromUserId }, after: { userId } })
  await NotificationService.notifyUser(swap.fromUserId, 'Swap accepted 🎉', 'Your shift has a new owner. Enjoy the time off!', '/rota/mine')
  return updated
}

export async function declineSwap(id: number, userId: number) {
  const swap = await openSwapFor(id, userId)
  await NotificationService.notifyUser(swap.fromUserId, 'Swap declined', 'Your colleague cannot take the shift. Maybe ask someone else?', '/rota/mine')
  return prisma.shiftSwap.update({ where: { id }, data: { status: 'DECLINED', decidedAt: new Date() } })
}

export async function cancelSwap(id: number, userId: number) {
  const swap = await prisma.shiftSwap.findUnique({ where: { id } })
  if (!swap || swap.fromUserId !== userId) throw new NotFoundError('Swap')
  if (swap.status !== 'PENDING') throw new BadRequestError(`This swap is already ${swap.status.toLowerCase()}`)
  return prisma.shiftSwap.update({ where: { id }, data: { status: 'CANCELLED', decidedAt: new Date() } })
}

/** Swaps I have been asked to take, and the ones I asked for. */
export async function swapsFor(userId: number) {
  const [incoming, outgoing] = await Promise.all([
    prisma.shiftSwap.findMany({ where: { toUserId: userId, status: 'PENDING' }, include: { shift: true }, orderBy: { createdAt: 'desc' } }),
    prisma.shiftSwap.findMany({ where: { fromUserId: userId }, include: { shift: true }, orderBy: { createdAt: 'desc' }, take: 10 }),
  ])
  const ids = [...new Set([...incoming, ...outgoing].flatMap((s) => [s.fromUserId, s.toUserId]))]
  const users = await prisma.user.findMany({ where: { id: { in: ids } }, select: { id: true, displayName: true, email: true } })
  const name = (id: number) => {
    const u = users.find((x) => x.id === id)
    return u ? (u.displayName ?? u.email) : '?'
  }
  const named = <T extends { fromUserId: number; toUserId: number }>(s: T) => ({ ...s, fromName: name(s.fromUserId), toName: name(s.toUserId) })
  return { incoming: incoming.map(named), outgoing: outgoing.map(named) }
}
