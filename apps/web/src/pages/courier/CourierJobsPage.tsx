import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiFetch } from '../../api'
import { useApi } from '../../hooks/useApi'
import { clock, KIND_ICON, localDay, STATUS_LABEL, type Courier, type CourierJob } from './types'

function addDays(day: string, n: number) {
  const [y, m, d] = day.split('-').map(Number)
  return localDay(new Date(y, m - 1, d + n))
}

export default function CourierJobsPage() {
  const [day, setDay] = useState(localDay())
  const [status, setStatus] = useState('')
  const [jobs, setJobs] = useState<CourierJob[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { data: couriers } = useApi<Courier[]>('/courier/couriers')

  const load = () => {
    setLoading(true)
    const params = new URLSearchParams({ date: day })
    if (status) params.set('status', status)
    apiFetch(`/courier/jobs?${params}`)
      .then(setJobs)
      .finally(() => setLoading(false))
  }

  useEffect(load, [day, status]) // eslint-disable-line react-hooks/exhaustive-deps

  const act = async (url: string, body: object) => {
    setError('')
    try {
      await apiFetch(url, { method: 'POST', body })
      load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  const active = (couriers ?? []).filter((c) => c.active)

  return (
    <div className="page">
      <h2>🪽 Wyvern courier</h2>
      <div className="toolbar">
        <Link to="/courier/new">+ New trip</Link>
        <Link to={`/courier/route-sheet?date=${day}`}>🗺️ Route sheet</Link>
        <button onClick={() => setDay(addDays(day, -1))}>←</button>
        <input type="date" value={day} onChange={(e) => setDay(e.target.value)} />
        <button onClick={() => setDay(addDays(day, 1))}>→</button>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {Object.entries(STATUS_LABEL).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="error">{error}</p>}
      <table className="table">
        <thead>
          <tr>
            <th>#</th>
            <th>Time</th>
            <th>Trip</th>
            <th>Lair</th>
            <th>Load</th>
            <th>Fee</th>
            <th>Courier</th>
            <th>Status</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {jobs.map((j) => (
            <tr key={j.id} className={j.status === 'DELIVERED' || j.status === 'CANCELLED' ? 'done' : ''}>
              <td>{j.id}</td>
              <td>
                {clock(j.scheduledFor)}
                <div className="muted">{j.durationMin} min</div>
              </td>
              <td>
                {j.direction === 'PICKUP' ? '⬇️ fetch' : '⬆️ take home'} <b>{j.monsterName}</b>
                <div className="muted">{j.customerName}</div>
                {j.stayId && <Link to={`/stays/${j.stayId}`}>stay #{j.stayId}</Link>}
              </td>
              <td>
                {j.address}
                <div className="muted">{Number(j.distanceLeagues)} leagues</div>
              </td>
              <td>{j.weightKg} kg</td>
              <td>{Number(j.fee).toFixed(2)} gp</td>
              <td>
                {j.status === 'REQUESTED' ? (
                  <select defaultValue="" onChange={(e) => e.target.value && act(`/courier/jobs/${j.id}/assign`, { courierId: Number(e.target.value) })}>
                    <option value="">assign...</option>
                    {active.map((c) => (
                      <option key={c.id} value={c.id} disabled={c.maxLoadKg < j.weightKg}>
                        {KIND_ICON[c.kind]} {c.name} ({c.maxLoadKg} kg)
                      </option>
                    ))}
                  </select>
                ) : j.courier ? (
                  `${KIND_ICON[j.courier.kind]} ${j.courier.name}`
                ) : (
                  '—'
                )}
              </td>
              <td>{STATUS_LABEL[j.status]}</td>
              <td>
                {j.status === 'SCHEDULED' && <button onClick={() => act(`/courier/jobs/${j.id}/status`, { status: 'IN_FLIGHT' })}>Take off</button>}
                {j.status === 'IN_FLIGHT' && <button onClick={() => act(`/courier/jobs/${j.id}/status`, { status: 'DELIVERED' })}>Delivered</button>}
                {(j.status === 'REQUESTED' || j.status === 'SCHEDULED') && (
                  <button className="link" onClick={() => act(`/courier/jobs/${j.id}/status`, { status: 'CANCELLED' })}>
                    cancel
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {loading && <p>Loading...</p>}
      {!loading && jobs.length === 0 && <p className="muted">No trips this day. The wyverns are sunbathing on the battlements.</p>}

      <h3>Couriers</h3>
      <div className="cards">
        {(couriers ?? []).map((c) => (
          <div key={c.id} className="card">
            <b>
              {KIND_ICON[c.kind]} {c.name}
            </b>
            {!c.active && <span className="badge badge-warn">grounded</span>}
            <div className="muted">
              carries up to {c.maxLoadKg} kg, {c.speed} leagues/hour
            </div>
            {c.notes && <div>{c.notes}</div>}
          </div>
        ))}
      </div>
    </div>
  )
}
