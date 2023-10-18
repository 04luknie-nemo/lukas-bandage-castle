// Is the courier free? A courier can only be on one trip at a time.

export type Trip = { id?: number; scheduledFor: Date; durationMin: number }

export function tripEnd(trip: Trip): Date {
  return new Date(trip.scheduledFor.getTime() + trip.durationMin * 60 * 1000)
}

/** True if `trip` would start while the courier is still out on `other`. */
export function clashes(trip: Trip, other: Trip): boolean {
  const start = trip.scheduledFor.getTime()
  return start >= other.scheduledFor.getTime() && start < tripEnd(other).getTime()
}

/** The first of the courier's existing trips that `trip` clashes with, if any. */
export function findClash(trip: Trip, existing: Trip[]): Trip | undefined {
  return existing.find((other) => other.id !== trip.id && clashes(trip, other))
}
