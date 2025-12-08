// Shift swaps: offers to me, and the ones I sent.
import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { format, parseISO } from 'date-fns'
import { apiFetch } from '../../api'
import { useAuth } from '../../auth/AuthProvider'
import { POST_ICON, timeRange, type Person, type Shift } from './types'

type Swap = { id: number; status: string; message: string | null; fromName: string; toName: string; shift: Shift }

function useRefresh() {
  const qc = useQueryClient()
  return () => {
    qc.invalidateQueries({ queryKey: ['rota-swaps'] })
    qc.invalidateQueries({ queryKey: ['rota-mine'] })
    qc.invalidateQueries({ queryKey: ['rota-week'] })
  }
}

export function OfferSwap({ shift, onDone }: { shift: Shift; onDone: () => void }) {
  const { user } = useAuth()
  const refresh = useRefresh()
  const [toUserId, setTo] = useState('')
  const [message, setMessage] = useState('')
  const { data: people } = useQuery({ queryKey: ['rota-staff'], queryFn: () => apiFetch('/rota/staff') as Promise<Person[]> })
  const offer = useMutation({
    mutationFn: () => apiFetch(`/rota/shifts/${shift.id}/swap`, { method: 'POST', body: { toUserId: Number(toUserId), message: message || undefined } }),
    onSuccess: () => {
      refresh()
      onDone()
    },
  })
  return (
    <span className="form inline">
      <select value={toUserId} onChange={(e) => setTo(e.target.value)}>
        <option value="">ask who?</option>
        {(people ?? [])
          .filter((p) => p.id !== user?.id)
          .map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
      </select>
      <input placeholder="message" value={message} onChange={(e) => setMessage(e.target.value)} />
      <button disabled={!toUserId} onClick={() => offer.mutate()}>
        Ask
      </button>
      <button className="link" onClick={onDone}>
        never mind
      </button>
      {offer.error && <span className="error">{(offer.error as Error).message}</span>}
    </span>
  )
}

export default function SwapsPanel() {
  const refresh = useRefresh()
  const { data } = useQuery({ queryKey: ['rota-swaps'], queryFn: () => apiFetch('/rota/swaps') as Promise<{ incoming: Swap[]; outgoing: Swap[] }> })
  const act = useMutation({
    mutationFn: ({ id, action }: { id: number; action: 'accept' | 'decline' | 'cancel' }) => apiFetch(`/rota/swaps/${id}/${action}`, { method: 'POST' }),
    onSuccess: refresh,
  })
  const waiting = data?.outgoing.filter((s) => s.status === 'PENDING') ?? []
  if (!data || (data.incoming.length === 0 && waiting.length === 0)) return null

  return (
    <div className="panel">
      <h3>🔁 Swaps</h3>
      {data.incoming.map((s) => (
        <div key={s.id}>
          <b>{s.fromName}</b> asks if you can take {POST_ICON[s.shift.post]} {format(parseISO(s.shift.startsAt), 'EEE d MMM')} {timeRange(s.shift)}
          {s.message && <span className="muted"> “{s.message}”</span>} <button onClick={() => act.mutate({ id: s.id, action: 'accept' })}>Take it</button>{' '}
          <button className="link" onClick={() => act.mutate({ id: s.id, action: 'decline' })}>
            no thanks
          </button>
        </div>
      ))}
      {waiting.map((s) => (
        <div key={s.id} className="muted">
          You asked {s.toName} to take {format(parseISO(s.shift.startsAt), 'EEE d MMM')} {timeRange(s.shift)}.{' '}
          <button className="link" onClick={() => act.mutate({ id: s.id, action: 'cancel' })}>
            cancel
          </button>
        </div>
      ))}
      {act.error && <p className="error">{(act.error as Error).message}</p>}
    </div>
  )
}
