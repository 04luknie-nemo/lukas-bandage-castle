import { useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { apiFetch } from '../../api'
import { useApi } from '../../hooks/useApi'
import { formatShortDate, timeAgo, userName } from '../../utils/format'
import { CATEGORY_ICON, PRIORITY_ICON, STATUS_LABEL, type Ticket, type TicketComment, type UserRef } from './types'

type TicketDetail = Ticket & { comments: TicketComment[] }

const NEXT_STATUSES: Record<Ticket['status'], Ticket['status'][]> = {
  OPEN: ['IN_PROGRESS', 'BLOCKED', 'DONE'],
  IN_PROGRESS: ['BLOCKED', 'DONE', 'OPEN'],
  BLOCKED: ['IN_PROGRESS', 'OPEN'],
  DONE: ['OPEN'],
}

export default function TicketDetailPage() {
  const { id } = useParams()
  const { data: ticket, error, reload } = useApi<TicketDetail>(`/tickets/${id}`)
  const { data: assignees } = useApi<UserRef[]>('/tickets/assignees')
  const [comment, setComment] = useState('')

  if (error) return <p className="page error">{error.message}</p>
  if (!ticket) return <p className="page">Loading...</p>

  const setStatus = async (status: Ticket['status']) => {
    await apiFetch(`/tickets/${ticket.id}/status`, { method: 'PATCH', body: { status } })
    reload()
  }

  const setAssignee = async (assigneeId: string) => {
    await apiFetch(`/tickets/${ticket.id}`, { method: 'PATCH', body: { assigneeId: assigneeId ? Number(assigneeId) : null } })
    reload()
  }

  const addComment = async (e: FormEvent) => {
    e.preventDefault()
    await apiFetch(`/tickets/${ticket.id}/comments`, { method: 'POST', body: { body: comment } })
    setComment('')
    reload()
  }

  return (
    <div className="page">
      <Link to="/tickets">← Tickets</Link>
      <h2>
        {CATEGORY_ICON[ticket.category]} #{ticket.id} {ticket.title}
      </h2>
      <p>
        {PRIORITY_ICON[ticket.priority]} {ticket.priority.toLowerCase()} priority · <b>{STATUS_LABEL[ticket.status]}</b> · reported by{' '}
        {userName(ticket.reporter)} {timeAgo(ticket.createdAt)}
        {ticket.dueDate && <> · due {formatShortDate(ticket.dueDate)}</>}
      </p>
      {ticket.description && <p className="description">{ticket.description}</p>}

      <div className="toolbar">
        {NEXT_STATUSES[ticket.status].map((s) => (
          <button key={s} onClick={() => setStatus(s)}>
            → {STATUS_LABEL[s]}
          </button>
        ))}
        <label>
          Assignee{' '}
          <select value={ticket.assignee?.id ?? ''} onChange={(e) => setAssignee(e.target.value)}>
            <option value="">nobody</option>
            {assignees?.map((u) => (
              <option key={u.id} value={u.id}>
                {userName(u)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <h3>💬 Comments</h3>
      {ticket.comments.map((c) => (
        <div className="comment" key={c.id}>
          <b>{userName(c.author)}</b> <span className="muted">{timeAgo(c.createdAt)}</span>
          <p>{c.body}</p>
        </div>
      ))}
      <form className="form" onSubmit={addComment}>
        <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Add a comment..." />
        <div>
          <button disabled={!comment.trim()}>Comment</button>
        </div>
      </form>
    </div>
  )
}
