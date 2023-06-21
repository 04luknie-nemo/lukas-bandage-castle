import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiFetch } from '../../api'
import { useApi } from '../../hooks/useApi'
import { userName } from '../../utils/format'
import { CATEGORY_ICON, PRIORITY_ICON, type UserRef } from './types'

export default function NewTicketPage() {
  const navigate = useNavigate()
  const { data: assignees } = useApi<UserRef[]>('/tickets/assignees')
  const { data: lairs } = useApi<{ id: number; name: string }[]>('/lairs')
  const [t, setT] = useState({ title: '', description: '', priority: 'MEDIUM', category: 'OTHER', assigneeId: '', lairId: '', dueDate: '' })
  const [error, setError] = useState('')

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      const created = await apiFetch('/tickets', {
        method: 'POST',
        body: {
          title: t.title,
          description: t.description || undefined,
          priority: t.priority,
          category: t.category,
          assigneeId: t.assigneeId ? Number(t.assigneeId) : null,
          lairId: t.lairId ? Number(t.lairId) : null,
          dueDate: t.dueDate || null,
        },
      })
      navigate(`/tickets/${created.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create ticket')
    }
  }

  return (
    <div className="page">
      <h2>🎫 New ticket</h2>
      <form className="form" onSubmit={submit}>
        <label>Title</label>
        <input value={t.title} onChange={(e) => setT({ ...t, title: e.target.value })} placeholder="e.g. Portcullis stuck half open again" />
        <label>Description</label>
        <textarea value={t.description} onChange={(e) => setT({ ...t, description: e.target.value })} />
        <label>Category</label>
        <select value={t.category} onChange={(e) => setT({ ...t, category: e.target.value })}>
          {Object.entries(CATEGORY_ICON).map(([c, icon]) => (
            <option key={c} value={c}>
              {icon} {c.toLowerCase()}
            </option>
          ))}
        </select>
        <label>Priority</label>
        <select value={t.priority} onChange={(e) => setT({ ...t, priority: e.target.value })}>
          {Object.entries(PRIORITY_ICON).map(([p, icon]) => (
            <option key={p} value={p}>
              {icon} {p.toLowerCase()}
            </option>
          ))}
        </select>
        <label>Assignee</label>
        <select value={t.assigneeId} onChange={(e) => setT({ ...t, assigneeId: e.target.value })}>
          <option value="">nobody yet</option>
          {assignees?.map((u) => (
            <option key={u.id} value={u.id}>
              {userName(u)}
            </option>
          ))}
        </select>
        <label>Lair (optional)</label>
        <select value={t.lairId} onChange={(e) => setT({ ...t, lairId: e.target.value })}>
          <option value="">--</option>
          {lairs?.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </select>
        <label>Due</label>
        <input type="date" value={t.dueDate} onChange={(e) => setT({ ...t, dueDate: e.target.value })} />
        <div>
          <button type="submit" disabled={t.title.trim().length < 3}>
            Create
          </button>
        </div>
        {error && <p className="error">{error}</p>}
      </form>
    </div>
  )
}
