export type ListingMonster = {
  id: number
  name: string
  birthDate: string | null
  temperament: string | null
  quirks: string | null
  status: string
  species: { id: number; name: string; slug: string; dangerLevel: number } | null
}

export type Listing = {
  id: number
  monsterId: number
  title: string
  pitch: string
  skills: string[]
  availableFrom: string
  feeGold: number
  status: 'DRAFT' | 'OPEN' | 'CLOSED'
  monster: ListingMonster
}
