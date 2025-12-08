// The weekly rota: who works when, and where we are short.
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { addDays, format, parseISO } from 'date-fns'
import { hasRole } from '@bandage/shared'
import { apiFetch } from '../../api'
import { useAuth } from '../../auth/AuthProvider'
import { MAX_HOURS, onDay, POST_ICON, POST_LABEL, timeRange, type Leave, type Post, type Week } from './types'

function shiftWeek(start: string, weeks: number) {
  return format(addDays(parseISO(start), weeks * 7), 'yyyy-MM-dd')
}

function AddShift({ week }: { week: Week }) {
  const qc = useQueryClient()
  const [f, setF] = useState({ userId: '', day: week.days[0], from: '07:00', to: '15:00', post: 'KEEPER', area: '' })
  const add = useMutation({
    mutationFn: () => {
      // a shift that ends "earlier" than it starts goes past midnight
      const endDay = f.to <= f.from ? format(addDays(parseISO(f.day), 1), 'yyyy-MM-dd') : f.day
      return apiFetch('/rota/shifts', {
        method: 'POST',
        body: { userId: Number(f.userId), startsAt: `${f.day}T${f.from}`, endsAt: `${endDay}T${f.to}`, post: f.post, area: f.area || undefined },
      })
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['rota-week'] }),
  })

  return (
    <div className="form inline wrap">
      <select value={f.userId} onChange={(e) => setF({ ...f, userId: e.target.value })}>
        <option value="">who?</option>
        {week.people.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
      <select value={f.day} onChange={(e) => setF({ ...f, day: e.target.value })}>
        {week.days.map((d) => (
          <option key={d} value={d}>
            {format(parseISO(d), 'EEE d MMM')}
          </option>
        ))}
      </select>
      <input type="time" value={f.from} onChange={(e) => setF({ ...f, from: e.target.value })} />
      <input type="time" value={f.to} onChange={(e) => setF({ ...f, to: e.target.value })} />
      <select value={f.post} onChange={(e) => setF({ ...f, post: e.target.value })}>
        {Object.entries(POST_LABEL).map(([value, label]) => (
          <option key={value} value={value}>
            {POST_ICON[value as Post]} {label}
          </option>
        ))}
      </select>
      <input placeholder="where? (optional)" value={f.area} onChange={(e) => setF({ ...f, area: e.target.value })} />
      <button disabled={!f.userId || add.isPending} onClick={() => add.mutate()}>
        + Add shift
      </button>
      {add.error && <span className="error">{(add.error as Error).message}</span>}
    </div>
  )
}

function PendingLeave() {
  const qc = useQueryClient()
  const { data: pending } = useQuery({ queryKey: ['rota-leave-pending'], queryFn: () => apiFetch('/rota/time-off/pending') as Promise<(Leave & { name: string })[]> })
  const decide = useMutation({
    mutationFn: ({ id, status }: { id: number; status: 'APPROVED' | 'REJECTED' }) => apiFetch(`/rota/time-off/${id}/decide`, { method: 'POST', body: { status } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['rota-leave-pending'] })
      qc.invalidateQueries({ queryKey: ['rota-week'] })
    },
  })
  if (!pending?.length) return null
  return (
    <div className="panel">
      <h3>🌴 Time off waiting for you</h3>
      {pending.map((l) => (
        <div key={l.id}>
          <b>{l.name}</b>: {format(parseISO(l.fromDate), 'd MMM')} – {format(parseISO(l.toDate), 'd MMM')} {l.reason && <span className="muted">({l.reason})</span>}{' '}
          <button onClick={() => decide.mutate({ id: l.id, status: 'APPROVED' })}>Approve</button>{' '}
          <button className="link" onClick={() => decide.mutate({ id: l.id, status: 'REJECTED' })}>
            reject
          </button>
        </div>
      ))}
    </div>
  )
}

export default function RotaWeekPage() {
  const { user } = useAuth()
  const admin = hasRole(user, 'ADMIN')
  const qc = useQueryClient()
  const [start, setStart] = useState<string | null>(null)
  const { data: week, isLoading } = useQuery({
    queryKey: ['rota-week', start],
    queryFn: () => apiFetch(`/rota/week${start ? `?start=${start}` : ''}`) as Promise<Week>,
  })
  const remove = useMutation({
    mutationFn: (id: number) => apiFetch(`/rota/shifts/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['rota-week'] }),
  })

  if (isLoading || !week) return <p className="page">Loading...</p>

  return (
    <div className="page">
      <h2>🗓️ Rota</h2>
      <div className="toolbar">
        <button onClick={() => setStart(shiftWeek(week.start, -1))}>← previous week</button>
        <b>Week of {format(parseISO(week.start), 'd MMMM yyyy')}</b>
        <button onClick={() => setStart(shiftWeek(week.start, 1))}>next week →</button>
        <Link to="/rota/mine">My shifts</Link>
      </div>

      {admin && <AddShift week={week} />}

      <table className="table rota">
        <thead>
          <tr>
            <th />
            {week.days.map((d) => (
              <th key={d}>{format(parseISO(d), 'EEE d')}</th>
            ))}
            <th>Hours</th>
          </tr>
        </thead>
        <tbody>
          {week.people.map((p) => (
            <tr key={p.id}>
              <td>
                <b>{p.name}</b>
              </td>
              {week.days.map((d) => {
                const leave = p.leave.find((l) => l.status === 'APPROVED' && onDay(l, d))
                const shifts = p.shifts.filter((s) => format(parseISO(s.startsAt), 'yyyy-MM-dd') === d)
                return (
                  <td key={d}>
                    {leave && <span className="badge">🌴 leave</span>}
                    {shifts.map((s) => (
                      <div key={s.id} title={[POST_LABEL[s.post], s.area, s.note].filter(Boolean).join(' · ')}>
                        {POST_ICON[s.post]} {timeRange(s)}
                        {admin && (
                          <button className="link" onClick={() => remove.mutate(s.id)} title="remove">
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                  </td>
                )
              })}
              <td>
                {p.hours} h {p.hours > MAX_HOURS && <span className="badge badge-danger">over {MAX_HOURS}!</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {week.gaps.length > 0 ? (
        <div className="warning">
          <b>⚠️ Not enough cover:</b>
          <ul>
            {week.gaps.map((g) => (
              <li key={`${g.day}-${g.post}`}>
                {format(parseISO(g.day), 'EEE d MMM')}: {g.label} ({g.have} of {g.need})
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="success">✅ Every day is covered.</p>
      )}

      {admin && <PendingLeave />}
    </div>
  )
}
