// Monster Arena - friendly contests between residents.
// idea from Lady Grimsby. ticket sales could pay for the new east wing!!

export const CONTESTS: any = {
  ROAR: { name: 'Loudest roar', stat: 'volume' },
  STARE: { name: 'Staring contest', stat: 'focus' },
  RIDDLE: { name: 'Riddle-off', stat: 'wits' },
  HOARD: { name: 'Fastest hoard sorting', stat: 'greed' },
}

// rough stats by species. TODO move to db
const SPECIES_STATS: any = {
  dragon: { volume: 9, focus: 6, wits: 7, greed: 10 },
  troll: { volume: 7, focus: 3, wits: 2, greed: 5 },
  basilisk: { volume: 2, focus: 10, wits: 5, greed: 3 },
  goblin: { volume: 4, focus: 2, wits: 6, greed: 9 },
  ogre: { volume: 8, focus: 2, wits: 1, greed: 4 },
  hydra: { volume: 10, focus: 4, wits: 4, greed: 5 },
  gorgon: { volume: 3, focus: 9, wits: 6, greed: 4 },
  sphinx: { volume: 5, focus: 8, wits: 10, greed: 3 },
}

const DEFAULT_STATS = { volume: 5, focus: 5, wits: 5, greed: 5 }

export function statsFor(species: string) {
  if (!species) return DEFAULT_STATS
  return SPECIES_STATS[species.toLowerCase()] || DEFAULT_STATS
}

export function runContest(contest: string, a: any, b: any) {
  const c = CONTESTS[contest]
  if (!c) throw new Error('unknown contest ' + contest)
  const sa = statsFor(a.species)[c.stat] * 10 + Math.floor(Math.random() * 30)
  const sb = statsFor(b.species)[c.stat] * 10 + Math.floor(Math.random() * 30)
  let winner = null
  if (sa > sb) winner = a.id
  if (sb > sa) winner = b.id
  return { scoreA: sa, scoreB: sb, winner }
}

// round robin bracket
export function makeBracket(monsterIds: any[]) {
  const pairs = []
  for (let i = 0; i < monsterIds.length; i++) {
    for (let j = i + 1; j < monsterIds.length; j++) {
      pairs.push([monsterIds[i], monsterIds[j]])
    }
  }
  return pairs
}
