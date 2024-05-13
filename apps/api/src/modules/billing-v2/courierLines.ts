// Courier trips (Tobias' wyvern module) go on the v2 invoice as their own lines. 🪽
import type { LineDraft } from './engine'

export type DeliveredTrip = {
  direction: string
  distanceLeagues: number | string | { toString(): string }
  fee: number | string | { toString(): string }
}

export function courierLines(trips: DeliveredTrip[]): LineDraft[] {
  return trips.map((trip) => {
    const fee = Math.round(Number(trip.fee)) // no float maths on money: whole coins only
    const where = trip.direction === 'PICKUP' ? 'pickup from' : 'return to'
    return {
      description: `Wyvern courier, ${where} the lair (${Number(trip.distanceLeagues)} leagues)`,
      quantity: 1,
      unitCopper: fee,
      amountCopper: fee,
      kind: 'OTHER',
    }
  })
}
