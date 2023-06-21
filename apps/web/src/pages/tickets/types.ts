export type UserRef = { id: number; displayName: string | null; email: string }

export type Ticket = {
  id: number
  title: string
  description: string | null
  status: 'OPEN' | 'IN_PROGRESS' | 'BLOCKED' | 'DONE'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  category: 'MAINTENANCE' | 'ESCAPE' | 'CLEANING' | 'SUPPLIES' | 'OTHER'
  assignee: UserRef | null
  reporter: UserRef
  lairId: number | null
  dueDate: string | null
  createdAt: string
  updatedAt: string
  closedAt: string | null
  _count?: { comments: number }
}

export type TicketComment = { id: number; body: string; createdAt: string; author: UserRef }

export const PRIORITY_ICON: Record<Ticket['priority'], string> = { LOW: '🟢', MEDIUM: '🟡', HIGH: '🟠', URGENT: '🔴' }

export const CATEGORY_ICON: Record<Ticket['category'], string> = {
  MAINTENANCE: '🔧',
  ESCAPE: '🏃',
  CLEANING: '🧹',
  SUPPLIES: '📦',
  OTHER: '📝',
}

export const STATUS_LABEL: Record<Ticket['status'], string> = {
  OPEN: 'Open',
  IN_PROGRESS: 'In progress',
  BLOCKED: 'Blocked',
  DONE: 'Done',
}
