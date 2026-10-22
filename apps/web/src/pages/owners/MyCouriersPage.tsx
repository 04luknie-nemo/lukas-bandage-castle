// "When is the wyvern coming?" — the most asked question at the front desk.
import { useQuery } from '@tanstack/react-query'
import { toGoldString } from '@bandage/shared'
import { apiFetch } from '../../api'
import { Card, EmptyState, ErrorMessage, Spinner, StatusBadge } from '../../components/ui'
import { formatDateTime, fromNow } from '../../utils/dates'

type Trip = {
  id: number
  monsterName: string
  direction: 'PICKUP' | 'RETURN'
  scheduledFor: string
  status: string
  courier: { name: string; kind: string } | null
  address: string
  fee: string
  deliveredAt: string | null
}

const KIND_ICON: Record<string, string> = { WYVERN: '🐉', GRIFFIN: '🦅', BAT_SWARM: '🦇', CART: '🛒' }

function TripRow({ t }: { t: Trip }) {
  return (
    <tr>
      <td>
        <b>{formatDateTime(t.scheduledFor)}</b>
        {t.status !== 'DELIVERED' && <div className="muted">{fromNow(t.scheduledFor)}</div>}
      </td>
      <td>{t.direction === 'PICKUP' ? `We collect ${t.monsterName} from ${t.address}` : `${t.monsterName} flies home to ${t.address}`}</td>
      <td>{t.courier ? `${KIND_ICON[t.courier.kind] ?? ''} ${t.courier.name}` : <span className="muted">courier not chosen yet</span>}</td>
      <td>{toGoldString(t.fee)}</td>
      <td>
        <StatusBadge status={t.status} />
      </td>
    </tr>
  )
}

export default function MyCouriersPage() {
  const { data: trips, error, isLoading } = useQuery({ queryKey: ['my-couriers'], queryFn: () => apiFetch('/my/couriers') as Promise<Trip[]> })

  if (isLoading) return <Spinner />
  if (error) return <ErrorMessage error={error} />

  const now = Date.now()
  const upcoming = (trips ?? []).filter((t) => t.status !== 'DELIVERED' && new Date(t.scheduledFor).getTime() > now - 6 * 3600 * 1000).reverse()
  const past = (trips ?? []).filter((t) => !upcoming.includes(t))

  return (
    <div className="page">
      <h2>🪽 Courier</h2>
      <p className="muted">Our wyverns fetch your monsters from your lair and fly them home again. Please keep the drawbridge down and the archers indoors.</p>
      <Card title="Coming up">
        {upcoming.length === 0 ? (
          <EmptyState title="No trips planned" icon="🪽" />
        ) : (
          <table className="table">
            <tbody>
              {upcoming.map((t) => (
                <TripRow key={t.id} t={t} />
              ))}
            </tbody>
          </table>
        )}
      </Card>
      {past.length > 0 && (
        <Card title="Recent trips">
          <table className="table">
            <tbody>
              {past.map((t) => (
                <TripRow key={t.id} t={t} />
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  )
}
