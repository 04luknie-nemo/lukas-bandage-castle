export const STAY_REASONS = ['BOARDING', 'TREATMENT', 'THERAPY', 'SURRENDER'] as const
export type StayReason = (typeof STAY_REASONS)[number]

export const STAY_STATUSES = ['BOOKED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED'] as const
export type StayStatus = (typeof STAY_STATUSES)[number]

export const MONSTER_STATUSES = ['IN_RESIDENCE', 'HOME', 'AVAILABLE', 'HIRED', 'RETIRED'] as const
export type MonsterStatus = (typeof MONSTER_STATUSES)[number]

export const CONTACT_PREFS = ['raven', 'crystal ball', 'email'] as const
export type ContactPref = (typeof CONTACT_PREFS)[number]
