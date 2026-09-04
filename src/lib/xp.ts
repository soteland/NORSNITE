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

// Cumulative XP required to reach each league.
// 15% compound growth on each step (500 → 575 → 661 → …), per PLAN.md.
// MUST stay in sync with the thresholds hardcoded in the update_difficulty()
// SQL function (supabase/migrations/003_rebalance.sql) — the client picks the
// displayed league, the server picks the difficulty floor off the same numbers.
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

// Minimum difficulty level enforced at each league.
// Deliberately shallow: difficulty is driven by the player's own self-report
// (DifficultyCheck, every 15 correct answers), and these floors exist only as a
// safety net so a player who always answers "for lett" can't sit at level 1
// forever. Do NOT raise these to track leagues 1:1 — that gates difficulty
// behind XP grinding rather than demonstrated ability.
export const LEAGUE_DIFFICULTY_FLOOR: Record<League, number> = {
  Bronze:   1,
  Silver:   1,
  Gold:     2,
  Platinum: 2,
  Diamond:  3,
  Elite:    4,
  Champion: 5,
  Unreal:   6,
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

export const BASE_XP = 5 // per correct answer

/**
 * Base XP a full round is worth before bonuses — round length × BASE_XP.
 * Loot rewards are scaled off this so a chest stays a constant share of income
 * (~20%) at every league instead of being worth 2-3 Bronze rounds.
 */
export function roundBaseXp(totalXp: number): number {
  return ROUND_LENGTH[getLeague(totalXp)] * BASE_XP
}

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

/**
 * Fraction of a round at or below which a bad round may earn a comeback bonus.
 * Was previously "zero correct", which at realistic accuracy fired roughly once
 * in 13 000 rounds — i.e. never. The bonus exists to hook a kid who just had a
 * discouraging session, so it has to be reachable on a genuinely bad round.
 */
export const COMEBACK_THRESHOLD = 0.4

/** 25% chance of a comeback bonus when a round goes badly (≤40% correct) */
export function rollComebackBonus(correct: number, total: number): boolean {
  if (total <= 0) return false
  if (correct / total > COMEBACK_THRESHOLD) return false
  return Math.random() < 0.25
}

/** 10% chance of crown at round start */
export function rollCrown(): boolean {
  return Math.random() < 0.10
}
