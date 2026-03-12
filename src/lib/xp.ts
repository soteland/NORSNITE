// XP and league tier logic

export const LEAGUES = [
  'Bronze',
  'Silver',
  'Gold',
  'Platinum',
  'Diamond',
  'Elite',
  'Champion',
  'Unreal',
] as const

export type League = (typeof LEAGUES)[number]

// Cumulative XP required to reach each league
export const LEAGUE_THRESHOLDS: Record<League, number> = {
  Bronze:   0,
  Silver:   1_000,
  Gold:     2_150,
  Platinum: 3_472,
  Diamond:  4_993,
  Elite:    6_742,
  Champion: 8_753,
  Unreal:   11_066,
}

// Minimum difficulty level enforced at each league
export const LEAGUE_DIFFICULTY_FLOOR: Record<League, number> = {
  Bronze:   1,
  Silver:   2,
  Gold:     3,
  Platinum: 4,
  Diamond:  5,
  Elite:    6,
  Champion: 7,
  Unreal:   8,
}

// Questions per round per league
export const ROUND_LENGTH: Record<League, number> = {
  Bronze:   5,
  Silver:   6,
  Gold:     7,
  Platinum: 7,
  Diamond:  8,
  Elite:    8,
  Champion: 9,
  Unreal:   9,
}

export const BASE_XP = 10 // per correct answer

export function getLeague(totalXp: number): League {
  const tiers = [...LEAGUES].reverse()
  for (const tier of tiers) {
    if (totalXp >= LEAGUE_THRESHOLDS[tier]) return tier
  }
  return 'Bronze'
}

export function xpToNextLeague(totalXp: number): { league: League; remaining: number } | null {
  const current = getLeague(totalXp)
  const idx = LEAGUES.indexOf(current)
  if (idx >= LEAGUES.length - 1) return null // already Unreal
  const next = LEAGUES[idx + 1]
  return { league: next, remaining: LEAGUE_THRESHOLDS[next] - totalXp }
}

export interface XpResult {
  baseXp: number
  skippedXp: number
  multiplier: number  // e.g. 1.875 for perfect + crown + comeback
  totalXp: number
  isPerfect: boolean
  isCrownWin: boolean
  isComeback: boolean
}

export function calculateXp(opts: {
  correct: number
  total: number
  usedSkip: boolean
  crownActive: boolean
  comebackBonus: boolean
}): XpResult {
  const { correct, total, usedSkip, crownActive, comebackBonus } = opts
  const isPerfect = !usedSkip && correct === total && total > 0
  const isCrownWin = crownActive && isPerfect

  const baseXp = correct * BASE_XP
  const skippedXp = usedSkip ? BASE_XP : 0  // skip earns base XP, no multiplier

  let multiplier = 1
  if (isPerfect) multiplier *= 1.25
  if (isCrownWin) multiplier *= 1.50
  if (comebackBonus) multiplier *= 1.25

  const totalXp = Math.round(baseXp * multiplier) + skippedXp

  return { baseXp, skippedXp, multiplier, totalXp, isPerfect, isCrownWin, isComeback: comebackBonus }
}

/** 25% chance of comeback bonus when a round scores zero */
export function rollComebackBonus(): boolean {
  return Math.random() < 0.25
}

/** 10% chance of crown at round start */
export function rollCrown(): boolean {
  return Math.random() < 0.10
}
