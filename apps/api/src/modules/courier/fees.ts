// Courier prices, as agreed with the Wyvern Guild in October 2023.
// All amounts in gold pieces.

export const BASE_FEE = 5
export const PER_LEAGUE = 1.5
/** anything heavier than this needs two harnesses */
export const HEAVY_KG = 500
export const HEAVY_SURCHARGE = 0.5 // +50 %
/** wyverns charge extra for flying in the dark */
export const NIGHT_SURCHARGE = 10
export const NIGHT_STARTS = 20
export const NIGHT_ENDS = 6

/** loading, unloading, and convincing the monster to get into the harness */
export const LOADING_MIN = 30
/** standard cruising speed used for planning, leagues per hour */
export const PLANNING_SPEED = 20

export type FeeInput = { distanceLeagues: number; weightKg: number; scheduledFor: Date }

export type FeeQuote = {
  base: number
  distance: number
  heavy: number
  night: number
  total: number
}

const round2 = (n: number) => Math.round(n * 100) / 100

export function isNightFlight(when: Date): boolean {
  const h = when.getHours()
  return h >= NIGHT_STARTS || h < NIGHT_ENDS
}

export function quote(input: FeeInput): FeeQuote {
  const base = BASE_FEE
  const distance = round2(input.distanceLeagues * PER_LEAGUE)
  const heavy = input.weightKg > HEAVY_KG ? round2((base + distance) * HEAVY_SURCHARGE) : 0
  const night = isNightFlight(input.scheduledFor) ? NIGHT_SURCHARGE : 0
  return { base, distance, heavy, night, total: round2(base + distance + heavy + night) }
}

/** Minutes the courier is away: there and back again, plus loading. */
export function tripMinutes(distanceLeagues: number, speed = PLANNING_SPEED): number {
  const flying = ((distanceLeagues * 2) / speed) * 60
  return Math.ceil(flying / 5) * 5 + LOADING_MIN
}
