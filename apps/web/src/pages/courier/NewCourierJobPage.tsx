import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiFetch } from '../../api'
import { localDay, type Quote } from './types'

type StayRow = {
  id: number
  monster_id: number
  monster_name: string
  species: string | null
  title: string | null
  last_name: string | null
  status: string
  start_date: string | null
  expected_pickup: string | null
}

export default function NewCourierJobPage() {
  const navigate = useNavigate()
  const [stays, setStays] = useState<StayRow[]>([])
  const [f, setF] = useState({ stayId: '', direction: 'PICKUP', date: localDay(), time: '10:00', distanceLeagues: '', weightKg: '', address: '', notes: '' })
  const [q, setQ] = useState<Quote | null>(null)
  const [error, setError] = useState('')

  // upcoming arrivals (pickups) and monsters going home (returns)
  useEffect(() => {
    Promise.all([apiFetch('/stays?status=BOOKED'), apiFetch('/stays?status=CHECKED_IN')]).then(([booked, here]) => setStays([...booked, ...here]))
  }, [])

  const stay = stays.find((s) => String(s.id) === f.stayId)

  const pickStay = (id: string) => {
    const s = stays.find((x) => String(x.id) === id)
    if (!s) return setF({ ...f, stayId: id })
    const direction = s.status === 'BOOKED' ? 'PICKUP' : 'RETURN'
    const when = direction === 'PICKUP' ? s.start_date : s.expected_pickup
    setF({ ...f, stayId: id, direction, date: when ? localDay(when) : f.date })
  }

  // live price while typing
  useEffect(() => {
    const distanceLeagues = Number(f.distanceLeagues)
    const weightKg = Number(f.weightKg)
    if (!distanceLeagues || !weightKg) return setQ(null)
    const t = setTimeout(() => {
      apiFetch('/courier/quote', { method: 'POST', body: { distanceLeagues, weightKg, scheduledFor: `${f.date}T${f.time}` } })
        .then(setQ)
        .catch(() => setQ(null))
    }, 300)
    return () => clearTimeout(t)
  }, [f.distanceLeagues, f.weightKg, f.date, f.time])

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!stay) return setError('Pick a stay first')
    setError('')
    try {
      await apiFetch('/courier/jobs', {
        method: 'POST',
        body: {
          stayId: stay.id,
          monsterId: stay.monster_id,
          direction: f.direction,
          scheduledFor: `${f.date}T${f.time}`,
          distanceLeagues: Number(f.distanceLeagues),
          weightKg: Number(f.weightKg),
          address: f.address || undefined,
          notes: f.notes || undefined,
        },
      })
      navigate('/courier')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not book the trip')
    }
  }

  return (
    <div className="page">
      <h2>🪽 New courier trip</h2>
      <form className="form" onSubmit={submit}>
        <label>Stay</label>
        <select value={f.stayId} onChange={(e) => pickStay(e.target.value)}>
          <option value="">--</option>
          {stays.map((s) => (
            <option key={s.id} value={s.id}>
              #{s.id} {s.monster_name} ({s.species ?? '?'}), {s.title} {s.last_name}, {s.status === 'BOOKED' ? 'arriving' : 'going home'}
            </option>
          ))}
        </select>
        <label>Direction</label>
        <select value={f.direction} onChange={(e) => setF({ ...f, direction: e.target.value })}>
          <option value="PICKUP">⬇️ Fetch from the lair</option>
          <option value="RETURN">⬆️ Take home to the lair</option>
        </select>
        <label>Day and time</label>
        <div>
          <input type="date" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} />
          <input type="time" value={f.time} step={900} onChange={(e) => setF({ ...f, time: e.target.value })} />
        </div>
        <label>Distance (leagues)</label>
        <input type="number" step="0.5" min="0.5" value={f.distanceLeagues} onChange={(e) => setF({ ...f, distanceLeagues: e.target.value })} />
        <label>Weight (kg, check the intake form)</label>
        <input type="number" min="1" value={f.weightKg} onChange={(e) => setF({ ...f, weightKg: e.target.value })} />
        <label>Lair address (leave empty for the one on file)</label>
        <input value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} placeholder="The Crag, third cave on the left" />
        <label>Notes for the courier</label>
        <textarea value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} placeholder="Sedate before take-off. Hates thunder." />

        {q && (
          <div className="panel">
            <div>Base fee: {q.base.toFixed(2)} gp</div>
            <div>Distance: {q.distance.toFixed(2)} gp</div>
            {q.heavy > 0 && <div>Heavy load: {q.heavy.toFixed(2)} gp</div>}
            {q.night > 0 && <div>🌙 Night flight: {q.night.toFixed(2)} gp</div>}
            <div className="fee">{q.total.toFixed(2)} gp</div>
            <div className="muted">The courier will be away about {q.durationMin} minutes.</div>
          </div>
        )}
        {error && <p className="error">{error}</p>}
        <button type="submit">Book trip</button>
      </form>
    </div>
  )
}
