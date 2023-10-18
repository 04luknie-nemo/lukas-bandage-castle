export type Courier = {
  id: number
  name: string
  kind: 'WYVERN' | 'GRIFFIN' | 'BAT_SWARM' | 'CART'
  maxLoadKg: number
  speed: number
  active: boolean
  notes: string | null
}

export type CourierJob = {
  id: number
  stayId: number | null
  monsterId: number
  monsterName: string
  customerId: number
  customerName: string
  direction: 'PICKUP' | 'RETURN'
  address: string
  distanceLeagues: string
  weightKg: number
  scheduledFor: string
  durationMin: number
  courierId: number | null
  courier: Pick<Courier, 'id' | 'name' | 'kind'> | null
  status: 'REQUESTED' | 'SCHEDULED' | 'IN_FLIGHT' | 'DELIVERED' | 'CANCELLED'
  fee: string
  notes: string | null
  deliveredAt: string | null
}

export type Quote = { base: number; distance: number; heavy: number; night: number; total: number; durationMin: number }

export const KIND_ICON: Record<Courier['kind'], string> = { WYVERN: '🐉', GRIFFIN: '🦅', BAT_SWARM: '🦇', CART: '🛒' }

export const STATUS_LABEL: Record<CourierJob['status'], string> = {
  REQUESTED: '📝 Requested',
  SCHEDULED: '📅 Scheduled',
  IN_FLIGHT: '🪽 In flight',
  DELIVERED: '✅ Delivered',
  CANCELLED: '✖️ Cancelled',
}

/** "09:05" */
export function clock(value: string): string {
  const d = new Date(value)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

/** yyyy-mm-dd in castle time (not UTC!) */
export function localDay(value: Date | string = new Date()): string {
  const d = new Date(value)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
