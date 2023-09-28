import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { toGoldString } from '@bandage/shared'
import { apiFetch } from '../../api'
import { useApi } from '../../hooks/useApi'
import type { Listing } from './types'

type MonsterOption = { id: number; name: string; species: string; status: string }

const EMPTY = { monsterId: '', title: '', pitch: '', skills: '', availableFrom: '', feeGold: '' }

export default function ManageListingsPage() {
  const { data: listings, reload } = useApi<Listing[]>('/hiring/listings/all')
  const { data: monsters } = useApi<MonsterOption[]>('/monsters')
  const [form, setForm] = useState(EMPTY)
  const [error, setError] = useState('')

  const create = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await apiFetch('/hiring/listings', {
        method: 'POST',
        body: {
          monsterId: Number(form.monsterId),
          title: form.title,
          pitch: form.pitch,
          skills: form.skills
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
          availableFrom: form.availableFrom,
          feeGold: Number(form.feeGold),
        },
      })
      setForm(EMPTY)
      reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create listing')
    }
  }

  const setStatus = async (id: number, status: Listing['status']) => {
    await apiFetch(`/hiring/listings/${id}/status`, { method: 'PATCH', body: { status } })
    reload()
  }

  return (
    <div className="page">
      <Link to="/hiring">← Hiring Hall</Link>
      <h2>📋 Manage listings</h2>
      <table className="table">
        <thead>
          <tr>
            <th>Listing</th>
            <th>Monster</th>
            <th>From</th>
            <th>Fee</th>
            <th>Status</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {listings?.map((l) => (
            <tr key={l.id}>
              <td>
                <Link to={`/hiring/${l.id}`}>{l.title}</Link>
              </td>
              <td>{l.monster.name}</td>
              <td>{l.availableFrom.slice(0, 10)}</td>
              <td>{toGoldString(l.feeGold)}</td>
              <td>{l.status}</td>
              <td>
                {l.status !== 'OPEN' && <button onClick={() => setStatus(l.id, 'OPEN')}>Open</button>}
                {l.status === 'OPEN' && <button onClick={() => setStatus(l.id, 'CLOSED')}>Close</button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>New listing</h3>
      <form className="form" onSubmit={create}>
        <label>Monster</label>
        <select value={form.monsterId} onChange={(e) => setForm({ ...form, monsterId: e.target.value })}>
          <option value="">--</option>
          {monsters
            ?.filter((m) => m.status === 'AVAILABLE' || m.status === 'IN_RESIDENCE')
            .map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.species})
              </option>
            ))}
        </select>
        <label>Title</label>
        <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Experienced hoard guardian seeks damp cave" />
        <label>Pitch</label>
        <textarea value={form.pitch} onChange={(e) => setForm({ ...form, pitch: e.target.value })} />
        <label>Skills (comma separated)</label>
        <input value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} placeholder="treasure guarding, menacing growls" />
        <label>Available from</label>
        <input type="date" value={form.availableFrom} onChange={(e) => setForm({ ...form, availableFrom: e.target.value })} />
        <label>Fee (gp)</label>
        <input value={form.feeGold} onChange={(e) => setForm({ ...form, feeGold: e.target.value })} />
        <div>
          <button type="submit">Create draft</button>
        </div>
        {error && <p className="error">{error}</p>}
      </form>
    </div>
  )
}
