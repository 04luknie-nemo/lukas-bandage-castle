import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiFetch } from '../../api'
import { useApi } from '../../hooks/useApi'

type PendingStay = {
  id: number
  reason: string
  startDate: string
  monster: { id: number; name: string; species: { name: string } | null }
  customer: { title: string | null; firstName: string | null; lastName: string | null }
}

type IntakeForm = {
  conditionOnArrival: string
  weightKg: string
  injuries: string
  behaviourNotes: string
  belongings: string
}

const EMPTY: IntakeForm = { conditionOnArrival: '', weightKg: '', injuries: '', behaviourNotes: '', belongings: '' }

function validateForm(form: IntakeForm, stay: PendingStay | undefined) {
  const errors: Partial<Record<keyof IntakeForm, string>> = {}
  if (!form.conditionOnArrival) errors.conditionOnArrival = 'Pick a condition'
  if (form.weightKg && (isNaN(Number(form.weightKg)) || Number(form.weightKg) <= 0)) errors.weightKg = 'Weight must be a positive number'
  if (stay?.reason === 'TREATMENT' && !form.injuries.trim()) errors.injuries = 'Treatment stays need a description of the injuries'
  return errors
}

export default function IntakePage() {
  const navigate = useNavigate()
  const { data: pending, loading } = useApi<PendingStay[]>('/intake/pending')
  const [stayId, setStayId] = useState<number | null>(null)
  const [form, setForm] = useState<IntakeForm>(EMPTY)
  const [errors, setErrors] = useState<Partial<Record<keyof IntakeForm, string>>>({})
  const [saving, setSaving] = useState(false)
  const [serverError, setServerError] = useState('')

  const stay = pending?.find((s) => s.id === stayId)
  const hasErrors = Object.keys(errors).length > 0

  const set = (field: keyof IntakeForm, value: string) => setForm({ ...form, [field]: value })

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const errs = validateForm(form, stay)
    setErrors(errs)
    if (Object.keys(errs).length > 0 || !stay) return
    setSaving(true)
    setServerError('')
    try {
      await apiFetch('/intake', {
        method: 'POST',
        body: {
          stayId: stay.id,
          conditionOnArrival: form.conditionOnArrival,
          weightKg: form.weightKg ? Number(form.weightKg) : undefined,
          injuries: form.injuries || undefined,
          behaviourNotes: form.behaviourNotes || undefined,
          belongings: form.belongings || undefined,
        },
      })
      navigate(`/stays/${stay.id}`)
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Intake failed')
      setSaving(false)
    }
  }

  if (loading) return <p className="page">Checking the gate... 🚪</p>

  return (
    <div className="page">
      <h2>🚪 Intake</h2>
      {!pending || pending.length === 0 ? (
        <p>No arrivals expected. Put the kettle on. ☕</p>
      ) : (
        <>
          <label>Who is arriving?</label>
          <div className="arrivals">
            {pending.map((s) => (
              <button
                key={s.id}
                className={`arrival ${s.id === stayId ? 'selected' : ''}`}
                onClick={() => {
                  setStayId(s.id)
                  setForm(EMPTY)
                }}
              >
                <b>{s.monster.name}</b> <span className="muted">{s.monster.species?.name}</span>
                <br />
                {s.reason.toLowerCase()} · {s.customer.title} {s.customer.lastName} · {s.startDate.slice(0, 10)}
              </button>
            ))}
          </div>
        </>
      )}

      {stay && (
        <form className="form" onSubmit={submit}>
          <h3>
            Admitting {stay.monster.name} for {stay.reason.toLowerCase()} (<Link to={`/stays/${stay.id}`}>stay #{stay.id}</Link>)
          </h3>

          <label>Condition on arrival *</label>
          <select value={form.conditionOnArrival} onChange={(e) => set('conditionOnArrival', e.target.value)}>
            <option value="">--</option>
            <option value="EXCELLENT">Excellent</option>
            <option value="GOOD">Good</option>
            <option value="FAIR">Fair</option>
            <option value="POOR">Poor</option>
            <option value="CRITICAL">Critical 🚑</option>
          </select>
          {errors.conditionOnArrival && <p className="error">{errors.conditionOnArrival}</p>}

          <label>Weight (kg)</label>
          <input value={form.weightKg} onChange={(e) => set('weightKg', e.target.value)} />
          {errors.weightKg && <p className="error">{errors.weightKg}</p>}

          <label>Injuries {stay.reason === 'TREATMENT' && '*'}</label>
          <textarea value={form.injuries} onChange={(e) => set('injuries', e.target.value)} placeholder="e.g. arrow in left wing, singed tail" />
          {errors.injuries && <p className="error">{errors.injuries}</p>}

          <label>Behaviour notes</label>
          <textarea value={form.behaviourNotes} onChange={(e) => set('behaviourNotes', e.target.value)} />

          <label>Belongings</label>
          <textarea value={form.belongings} onChange={(e) => set('belongings', e.target.value)} placeholder="one golden goblet (do NOT let him hoard it)" />

          <div>
            <button type="submit" disabled={hasErrors || saving}>
              {saving ? 'Admitting...' : 'Admit monster'}
            </button>
          </div>
          {serverError && <p className="error">{serverError}</p>}
        </form>
      )}
    </div>
  )
}
