// My next four weeks, and asking for time off.
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { format, parseISO } from 'date-fns'
import { apiFetch } from '../../api'
import { POST_ICON, POST_LABEL, timeRange, type Leave, type Shift } from './types'
import SwapsPanel, { OfferSwap } from './SwapsPanel'

const LEAVE_ICON: Record<Leave['status'], string> = { REQUESTED: '⏳', APPROVED: '✅', REJECTED: '❌' }

function RequestLeave() {
  const qc = useQueryClient()
  const [f, setF] = useState({ fromDate: '', toDate: '', reason: '' })
  const ask = useMutation({
    mutationFn: () => apiFetch('/rota/time-off', { method: 'POST', body: { ...f, toDate: f.toDate || f.fromDate, reason: f.reason || undefined } }),
    onSuccess: () => {
      setF({ fromDate: '', toDate: '', reason: '' })
      qc.invalidateQueries({ queryKey: ['rota-mine'] })
    },
  })
  return (
    <div className="form inline wrap">
      <input type="date" value={f.fromDate} onChange={(e) => setF({ ...f, fromDate: e.target.value })} />
      <span>to</span>
      <input type="date" value={f.toDate} onChange={(e) => setF({ ...f, toDate: e.target.value })} />
      <input placeholder="reason (optional)" value={f.reason} onChange={(e) => setF({ ...f, reason: e.target.value })} />
      <button disabled={!f.fromDate || ask.isPending} onClick={() => ask.mutate()}>
        Ask for time off
      </button>
      {ask.error && <span className="error">{(ask.error as Error).message}</span>}
    </div>
  )
}

export default function MyShiftsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['rota-mine'],
    queryFn: () => apiFetch('/rota/mine') as Promise<{ shifts: Shift[]; leave: Leave[] }>,
  })
  const [offering, setOffering] = useState<number | null>(null)

  if (isLoading || !data) return <p className="page">Loading...</p>

  return (
    <div className="page">
      <h2>🗓️ My shifts</h2>
      <p>
        <Link to="/rota">← whole rota</Link>
      </p>

      <SwapsPanel />

      {data.shifts.length === 0 ? (
        <p className="muted">No shifts in the next four weeks. Lucky you.</p>
      ) : (
        <table className="table">
          <tbody>
            {data.shifts.map((s) => (
              <tr key={s.id}>
                <td>{format(parseISO(s.startsAt), 'EEEE d MMMM')}</td>
                <td>{timeRange(s)}</td>
                <td>
                  {POST_ICON[s.post]} {POST_LABEL[s.post]}
                  {s.area && <span className="muted"> · {s.area}</span>}
                </td>
                <td>
                  {offering === s.id ? (
                    <OfferSwap shift={s} onDone={() => setOffering(null)} />
                  ) : (
                    <button className="link" onClick={() => setOffering(s.id)}>
                      swap...
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h3>🌴 Time off</h3>
      <RequestLeave />
      <ul>
        {data.leave.map((l) => (
          <li key={l.id}>
            {LEAVE_ICON[l.status]} {format(parseISO(l.fromDate), 'd MMM')} – {format(parseISO(l.toDate), 'd MMM')} {l.reason && <span className="muted">({l.reason})</span>}
          </li>
        ))}
      </ul>
    </div>
  )
}
