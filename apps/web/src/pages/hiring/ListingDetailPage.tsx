import { Link, useParams } from 'react-router-dom'
import { ageInYears, hasRole, toGoldString } from '@bandage/shared'
import { useAuth } from '../../auth/AuthProvider'
import ApplyForm from './ApplyForm'
import { useApi } from '../../hooks/useApi'
import DangerLevel from '../species/DangerLevel'
import type { Listing } from './types'

export default function ListingDetailPage() {
  const { id } = useParams()
  const { data: listing, error } = useApi<Listing>(`/hiring/listings/${id}`)
  const { user } = useAuth()

  if (error) return <p className="page error">{error.message}</p>
  if (!listing) return <p className="page">Loading...</p>

  const m = listing.monster
  return (
    <div className="page">
      <Link to="/hiring">← Hiring Hall</Link>
      <div className="monster-header">
        <img src={`/api/monsters/${m.id}/photo`} alt={m.name} width={200} />
        <div>
          <h2>{listing.title}</h2>
          <p>
            <b>{m.name}</b> · {m.species?.name} · {ageInYears(m.birthDate) ?? '?'} years old
          </p>
          {m.species && <DangerLevel level={m.species.dangerLevel} />}
          <p className="fee">{toGoldString(listing.feeGold)}</p>
          <p className="muted">Available from {listing.availableFrom.slice(0, 10)}</p>
        </div>
      </div>
      <p className="description">{listing.pitch}</p>
      {m.temperament && (
        <p>
          <b>Temperament:</b> {m.temperament}
        </p>
      )}
      {m.quirks && (
        <p>
          <b>Quirks:</b> {m.quirks}
        </p>
      )}
      {hasRole(user, 'OVERLORD') && listing.status === 'OPEN' && <ApplyForm listingId={listing.id} monsterName={m.name} />}
    </div>
  )
}
