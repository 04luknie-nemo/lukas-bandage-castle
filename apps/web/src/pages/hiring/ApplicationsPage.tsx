import { useState } from 'react'
import { Link } from 'react-router-dom'
import { hasRole } from '@bandage/shared'
import { apiFetch } from '../../api'
import { useAuth } from '../../auth/AuthProvider'
import { useApi } from '../../hooks/useApi'

type Application = {
  id: number
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN'
  message: string
  lairDescription: string | null
  createdAt: string
  listing: { id: number; title: string; monster: { id: number; name: string } }
  references: { id: number; refereeName: string; relationship: string; text: string }[]
  customer: { id: number; title: string | null; firstName: string | null; lastName: string | null } | null
}

const STATUS_BADGE: Record<Application['status'], string> = {
  PENDING: 'badge-warn',
  ACCEPTED: 'badge-ok',
  REJECTED: 'badge-danger',
  WITHDRAWN: '',
}

export default function ApplicationsPage() {
  const { user } = useAuth()
  const isStaff = hasRole(user, 'ADMIN', 'FRONT_DESK')
  const [status, setStatus] = useState(isStaff ? 'PENDING' : '')
  const { data: apps, reload } = useApi<Application[]>(`/hiring/applications${status ? `?status=${status}` : ''}`)
  const [open, setOpen] = useState<number | null>(null)

  const decide = async (id: number, decision: 'ACCEPTED' | 'REJECTED') => {
    await apiFetch(`/hiring/applications/${id}/decision`, { method: 'POST', body: { decision } })
    reload()
  }

  const withdraw = async (id: number) => {
    await apiFetch(`/hiring/applications/${id}/withdraw`, { method: 'POST' })
    reload()
  }

  return (
    <div className="page">
      <h2>📜 {isStaff ? 'Applications' : 'My applications'}</h2>
      <select value={status} onChange={(e) => setStatus(e.target.value)}>
        <option value="">All</option>
        <option value="PENDING">Pending</option>
        <option value="ACCEPTED">Accepted</option>
        <option value="REJECTED">Rejected</option>
        <option value="WITHDRAWN">Withdrawn</option>
      </select>
      {apps?.length === 0 && <p className="muted">Nothing here.</p>}
      {apps?.map((a) => (
        <div className="card wide" key={a.id}>
          <h4>
            <Link to={`/hiring/${a.listing.id}`}>{a.listing.monster.name}</Link>
            {isStaff && a.customer && (
              <>
                {' '}
                ← {a.customer.title} {a.customer.firstName} {a.customer.lastName}
              </>
            )}{' '}
            <span className={`badge ${STATUS_BADGE[a.status]}`}>{a.status}</span>
          </h4>
          <p className="muted">{a.createdAt.slice(0, 10)}</p>
          <button className="link" onClick={() => setOpen(open === a.id ? null : a.id)}>
            {open === a.id ? 'hide' : 'details'}
          </button>
          {open === a.id && (
            <div>
              <p className="description">{a.message}</p>
              {a.lairDescription && (
                <p>
                  <b>Lair:</b> {a.lairDescription}
                </p>
              )}
              {a.references.map((r) => (
                <blockquote key={r.id}>
                  “{r.text}” — {r.refereeName}, {r.relationship}
                </blockquote>
              ))}
            </div>
          )}
          {isStaff && a.status === 'PENDING' && (
            <div className="toolbar">
              <button onClick={() => decide(a.id, 'ACCEPTED')}>✅ Accept</button>
              <button onClick={() => decide(a.id, 'REJECTED')}>❌ Reject</button>
            </div>
          )}
          {!isStaff && a.status === 'PENDING' && <button onClick={() => withdraw(a.id)}>Withdraw</button>}
        </div>
      ))}
    </div>
  )
}
