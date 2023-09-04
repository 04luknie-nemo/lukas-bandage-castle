import { Link } from 'react-router-dom'
import { ageInYears, toGoldString } from '@bandage/shared'
import DangerLevel from '../species/DangerLevel'
import type { Listing } from './types'

export default function ListingCard({ listing }: { listing: Listing }) {
  const m = listing.monster
  const age = ageInYears(m.birthDate)
  return (
    <Link to={`/hiring/${listing.id}`} className="card listing-card">
      <img src={`/api/monsters/${m.id}/photo`} alt={m.name} width={120} />
      <h3>{listing.title}</h3>
      <p>
        <b>{m.name}</b>, {m.species?.name ?? 'mystery creature'}
        {age !== null && `, ${age} yrs`}
      </p>
      {m.species && <DangerLevel level={m.species.dangerLevel} />}
      <div className="skills">
        {listing.skills.map((s) => (
          <span className="badge" key={s}>
            {s}
          </span>
        ))}
      </div>
      <p className="fee">{toGoldString(listing.feeGold)}</p>
    </Link>
  )
}
