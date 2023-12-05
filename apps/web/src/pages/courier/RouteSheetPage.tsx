// The sheet the couriers take with them. Printed every morning and pinned up in the roost.
import { Link, useSearchParams } from 'react-router-dom'
import { useApi } from '../../hooks/useApi'
import { KIND_ICON, localDay, type Courier, type CourierJob } from './types'

type Sheet = {
  date: string
  couriers: { courier: Courier; pickups: CourierJob[]; returns: CourierJob[]; minutesAway: number }[]
  unassigned: CourierJob[]
}

/** 9:30 rather than 09:30, the drivers asked for it */
function shortTime(value: string) {
  const d = new Date(value)
  return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
}

type Stop = { time: string; job: CourierJob }

function stopsFor(entry: Sheet['couriers'][number]): Stop[] {
  return [...entry.pickups, ...entry.returns].map((job) => ({ time: shortTime(job.scheduledFor), job })).sort((a, b) => a.time.localeCompare(b.time))
}

export default function RouteSheetPage() {
  const [params] = useSearchParams()
  const date = params.get('date') || localDay()
  const { data: sheet, loading } = useApi<Sheet>(`/courier/route-sheet?date=${date}`)

  if (loading || !sheet) return <p className="page">Loading...</p>

  return (
    <div className="page">
      <p className="no-print">
        <Link to="/courier">← Courier</Link> <button onClick={() => window.print()}>🖨️ Print</button>
      </p>
      <h2>🗺️ Route sheet for {new Date(date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</h2>

      {sheet.couriers.length === 0 && <p className="muted">Nobody is flying today.</p>}
      {sheet.couriers.map((entry) => (
        <div key={entry.courier.id} className="panel route">
          <h3>
            {KIND_ICON[entry.courier.kind]} {entry.courier.name}
            <span className="muted">
              {' '}
              ({entry.pickups.length + entry.returns.length} trips, about {Math.round(entry.minutesAway / 6) / 10} hours in the air)
            </span>
          </h3>
          <table className="table">
            <tbody>
              {stopsFor(entry).map(({ time, job }) => (
                <tr key={job.id}>
                  <td>
                    <b>{time}</b>
                  </td>
                  <td>{job.direction === 'PICKUP' ? '⬇️ Collect' : '⬆️ Deliver'}</td>
                  <td>
                    <b>{job.monsterName}</b> ({job.weightKg} kg)
                  </td>
                  <td>
                    {job.address}
                    <div className="muted">
                      {Number(job.distanceLeagues)} leagues, {job.customerName}
                    </div>
                  </td>
                  <td>{job.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      {sheet.unassigned.length > 0 && (
        <div className="warning">
          ⚠️ {sheet.unassigned.length} trip(s) on this day have no courier yet:{' '}
          {sheet.unassigned.map((j) => `${j.monsterName} at ${shortTime(j.scheduledFor)}`).join(', ')}
        </div>
      )}
    </div>
  )
}
