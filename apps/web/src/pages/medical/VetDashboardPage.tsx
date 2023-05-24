import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useApi } from '../../hooks/useApi'
import type { Patient } from './types'

function PatientPanel({ patient }: { patient: Patient }) {
  const latest = patient.records[0]
  const ongoing = latest.treatments.filter((t) => t.status === 'ONGOING')

  return (
    <div className="panel">
      <h3>
        {patient.name} <span className="muted">{patient.species}</span>
      </h3>
      <p>
        Last seen <b>{latest.visitDate.slice(0, 10)}</b>: {latest.summary}
      </p>
      {latest.diagnosis && <p className="muted">{latest.diagnosis}</p>}
      <h4>Ongoing treatments</h4>
      {ongoing.length === 0 ? (
        <p className="muted">None</p>
      ) : (
        <ul>
          {ongoing.map((t) => (
            <li key={t.id}>
              {t.name} {t.startedAt && <span className="muted">since {t.startedAt.slice(0, 10)}</span>}
            </li>
          ))}
        </ul>
      )}
      <p>
        {patient.records.length} record(s) on file. <Link to={`/monsters/${patient.id}/medical`}>Open medical history →</Link>
      </p>
    </div>
  )
}

export default function VetDashboardPage() {
  const { data: patients, loading, error } = useApi<Patient[]>('/medical/patients')
  const [selected, setSelected] = useState<number | null>(null)

  if (error) return <p className="page error">{error.message}</p>
  if (loading || !patients) return <p className="page">Fetching the stethoscope... 🩺</p>

  const patient = patients.find((p) => p.id === selected)

  return (
    <div className="page">
      <h2>🩺 Vet dashboard</h2>
      <p className="muted">{patients.length} patients in care</p>
      <div className="split">
        <ul className="patient-list">
          {patients.map((p) => (
            <li key={p.id}>
              <button className={`patient ${p.id === selected ? 'selected' : ''}`} onClick={() => setSelected(p.id)}>
                <b>{p.name}</b> <span className="muted">{p.species}</span>
                {p.records.some((r) => r.treatments.some((t) => t.status === 'ONGOING')) && <span className="badge badge-warn">in treatment</span>}
              </button>
            </li>
          ))}
        </ul>
        {patient ? <PatientPanel patient={patient} /> : <p className="muted">Pick a patient on the left.</p>}
      </div>
    </div>
  )
}
