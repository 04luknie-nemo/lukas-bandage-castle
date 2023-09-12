import { Link } from 'react-router-dom'
import { hasRole } from '@bandage/shared'
import { useAuth } from '../../auth/AuthProvider'
import { useApi } from '../../hooks/useApi'
import ListingCard from './ListingCard'
import type { Listing } from './types'

export default function HiringHallPage() {
  const { user } = useAuth()
  const { data: listings, error } = useApi<Listing[]>('/hiring/listings')

  if (error) return <p className="page error">{error.message}</p>
  if (!listings) return <p className="page">Polishing the Hiring Hall... ✨</p>

  return (
    <div className="page">
      <h2>🏛️ The Hiring Hall</h2>
      <p className="muted">Loyal, rested and fully patched-up monsters, ready for a new lair.</p>
      <div className="toolbar">
        {hasRole(user, 'ADMIN', 'FRONT_DESK') && <Link to="/hiring/manage">Manage listings →</Link>}
        <Link to="/hiring/applications">{hasRole(user, 'ADMIN', 'FRONT_DESK') ? 'Applications' : 'My applications'} →</Link>
      </div>
      {listings.length === 0 ? (
        <p>Every monster has found a home. Check back soon!</p>
      ) : (
        <div className="cards">
          {listings.map((l) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>
      )}
    </div>
  )
}
