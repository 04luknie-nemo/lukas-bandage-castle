import { useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { hasRole } from '@bandage/shared'
import { apiFetch } from '../../api'
import { useAuth } from '../../auth/AuthProvider'
import { useApi } from '../../hooks/useApi'
import type { MedicalRecord, Treatment } from './types'

type Data = { monster: { id: number; name: string }; records: MedicalRecord[] }

const today = () => new Date().toISOString().slice(0, 10)

function TreatmentRow({ t, canEdit, onChange }: { t: Treatment; canEdit: boolean; onChange: () => void }) {
  const setStatus = async (status: Treatment['status']) => {
    await apiFetch(`/medical/treatments/${t.id}`, { method: 'PATCH', body: { status } })
    onChange()
  }
  return (
    <li>
      {t.name} <span className={`badge ${t.status === 'ONGOING' ? 'badge-warn' : t.status === 'COMPLETE' ? 'badge-ok' : ''}`}>{t.status}</span>
      {canEdit && t.status === 'PLANNED' && (
        <button className="link" onClick={() => setStatus('ONGOING')}>
          start
        </button>
      )}
      {canEdit && t.status === 'ONGOING' && (
        <button className="link" onClick={() => setStatus('COMPLETE')}>
          complete
        </button>
      )}
    </li>
  )
}

function AddTreatment({ recordId, onAdded }: { recordId: number; onAdded: () => void }) {
  const [name, setName] = useState('')
  const add = async (e: FormEvent) => {
    e.preventDefault()
    await apiFetch(`/medical/records/${recordId}/treatments`, { method: 'POST', body: { name, status: 'ONGOING' } })
    setName('')
    onAdded()
  }
  return (
    <form className="form inline" onSubmit={add}>
      <input placeholder="new treatment, e.g. wing splint" value={name} onChange={(e) => setName(e.target.value)} />
      <button disabled={name.trim().length < 2}>Add</button>
    </form>
  )
}

export default function MonsterMedicalPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const { data, error, reload } = useApi<Data>(`/medical/monsters/${id}/records`)
  const [form, setForm] = useState({ visitDate: today(), summary: '', diagnosis: '', notes: '' })
  const [formError, setFormError] = useState('')
  const isVet = hasRole(user, 'VET')

  if (error) return <p className="page error">{error.message}</p>
  if (!data) return <p className="page">Loading...</p>

  const addRecord = async (e: FormEvent) => {
    e.preventDefault()
    setFormError('')
    try {
      await apiFetch(`/medical/monsters/${id}/records`, { method: 'POST', body: form })
      setForm({ visitDate: today(), summary: '', diagnosis: '', notes: '' })
      reload()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Could not save')
    }
  }

  return (
    <div className="page">
      <Link to={`/monsters/${data.monster.id}`}>← {data.monster.name}</Link>
      <h2>🩹 Medical history: {data.monster.name}</h2>

      {data.records.length === 0 && <p className="muted">No records yet. A healthy monster!</p>}
      {data.records.map((r) => (
        <div className="card wide" key={r.id}>
          <h4>
            {r.visitDate.slice(0, 10)} — {r.summary}
          </h4>
          {r.diagnosis && <p>{r.diagnosis}</p>}
          {r.notes && <p className="muted">{r.notes}</p>}
          <ul>
            {r.treatments.map((t) => (
              <TreatmentRow key={t.id} t={t} canEdit={isVet} onChange={reload} />
            ))}
          </ul>
          {isVet && <AddTreatment recordId={r.id} onAdded={reload} />}
        </div>
      ))}

      {isVet && (
        <form className="form" onSubmit={addRecord}>
          <h3>New record</h3>
          <label>Visit date</label>
          <input type="date" value={form.visitDate} onChange={(e) => setForm({ ...form, visitDate: e.target.value })} />
          <label>Summary</label>
          <input value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} />
          <label>Diagnosis</label>
          <textarea value={form.diagnosis} onChange={(e) => setForm({ ...form, diagnosis: e.target.value })} />
          <label>Notes</label>
          <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <div>
            <button type="submit">Save record</button>
          </div>
          {formError && <p className="error">{formError}</p>}
        </form>
      )}
    </div>
  )
}
