import { format, parseISO } from 'date-fns'

export type Post = 'KEEPER' | 'NIGHT_WATCH' | 'VET' | 'FRONT_DESK' | 'THERAPIST'

export type Shift = {
  id: number
  userId: number
  startsAt: string
  endsAt: string
  post: Post
  area: string | null
  note: string | null
}

export type Leave = { id: number; userId: number; fromDate: string; toDate: string; reason: string | null; status: 'REQUESTED' | 'APPROVED' | 'REJECTED' }

export type Person = { id: number; name: string; roles: string[] }

export type Week = {
  start: string
  days: string[]
  people: (Person & { shifts: Shift[]; hours: number; leave: Leave[] })[]
  gaps: { day: string; post: Post; label: string; have: number; need: number }[]
}

export const POST_ICON: Record<Post, string> = {
  KEEPER: '🧹',
  NIGHT_WATCH: '🌙',
  VET: '🩺',
  FRONT_DESK: '🚪',
  THERAPIST: '🛋️',
}

export const POST_LABEL: Record<Post, string> = {
  KEEPER: 'Keeper',
  NIGHT_WATCH: 'Night watch',
  VET: 'Vet',
  FRONT_DESK: 'Front desk',
  THERAPIST: 'Therapist',
}

export const MAX_HOURS = 48

export function timeRange(s: Pick<Shift, 'startsAt' | 'endsAt'>): string {
  return `${format(parseISO(s.startsAt), 'HH:mm')}–${format(parseISO(s.endsAt), 'HH:mm')}`
}

/** DATE columns arrive as UTC midnight, so only look at the date part */
export function onDay(leave: Pick<Leave, 'fromDate' | 'toDate'>, day: string): boolean {
  return leave.fromDate.slice(0, 10) <= day && day <= leave.toDate.slice(0, 10)
}
