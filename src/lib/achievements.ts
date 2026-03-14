// Achievement definitions and check logic
// Badge visual: CSS circle with radial gradient + neon glow (see PLAN.md)

import { getLeague, type League } from './xp'

export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'

export interface Achievement {
  key: string
  emoji: string
  name: string         // Norwegian display name
  description: string  // Norwegian requirement description
  rarity: Rarity
}

export const RARITY_COLORS: Record<Rarity, string> = {
  common:    '#6b7280',
  uncommon:  '#22c55e',
  rare:      '#3b82f6',
  epic:      '#a855f7',
  legendary: '#f59e0b',
}

export const RARITY_LABELS: Record<Rarity, string> = {
  common:    'Vanlig',
  uncommon:  'Uvanlig',
  rare:      'Sjelden',
  epic:      'Episk',
  legendary: 'Legendarisk',
}

// ── Milestone achievements ──────────────────────────────────────────────────

export const ACHIEVEMENTS: Achievement[] = [
  // -- Vanlig (common) --
  { key: 'first_round',   emoji: '🎮', name: 'Første skritt',  description: 'Fullfør første runde',   rarity: 'common' },
  { key: 'perfect_round', emoji: '✅', name: 'Ren tavle',      description: 'Runde uten én feil',      rarity: 'common' },
  { key: 'first_friend',  emoji: '👥', name: 'Lagkamerat',     description: 'Legg til første venn',    rarity: 'common' },
  { key: 'rounds_10',     emoji: '📖', name: 'Leser',          description: '10 fullførte runder',     rarity: 'common' },

  // -- Uvanlig (uncommon) --
  { key: 'streak_3',      emoji: '🔥', name: 'På strekk',      description: '3 dager på rad',          rarity: 'uncommon' },
  { key: 'first_crown',   emoji: '👑', name: 'Krone',          description: 'Første krone-seier',      rarity: 'uncommon' },
  { key: 'rounds_50',     emoji: '📚', name: 'Bokorm',         description: '50 fullførte runder',     rarity: 'uncommon' },

  // -- Sjelden (rare) --
  { key: 'perfect_5_row', emoji: '🎯', name: 'Skarpskytter',   description: '5 perfekte runder på rad', rarity: 'rare' },
  { key: 'streak_7',      emoji: '🔥🔥', name: 'Ukestrekk',    description: '7 dager på rad',          rarity: 'rare' },
  { key: 'crown_5',       emoji: '👑👑', name: 'Kronekjemper',  description: '5 krone-seire',           rarity: 'rare' },
  { key: 'all_minigames', emoji: '🌍', name: 'Utforsker',      description: 'Spill alle 7 minigame-typer', rarity: 'rare' },

  // -- Episk (epic) --
  { key: 'rounds_100',    emoji: '🧠', name: 'Hjernekraft',    description: '100 fullførte runder',    rarity: 'epic' },
  { key: 'streak_30',     emoji: '🔥🔥🔥', name: 'Månedsstrekk', description: '30 dager på rad',       rarity: 'epic' },
  { key: 'crown_25',      emoji: '👑👑👑', name: 'Kronelord',    description: '25 krone-seire',         rarity: 'epic' },
  { key: 'league_diamond', emoji: '💎', name: 'Diamantsinn',   description: 'Nå Diamond league',       rarity: 'epic' },

  // -- Legendarisk (legendary) --
  { key: 'league_unreal', emoji: '🏆', name: 'Ureal',          description: 'Nå Unreal league',        rarity: 'legendary' },
  { key: 'rounds_500',    emoji: '💯', name: 'Mesteren',        description: '500 fullførte runder',    rarity: 'legendary' },
  { key: 'perfect_50',    emoji: '🌟', name: 'Ordmester',      description: '50 perfekte runder',      rarity: 'legendary' },
  { key: 'crown_50',      emoji: '👑🌟', name: 'Evig krone',    description: '50 krone-seire',         rarity: 'legendary' },
]

// ── Daily XP record badges ──────────────────────────────────────────────────

export const DAILY_XP_ACHIEVEMENTS: Achievement[] = [
  { key: 'daily_5',     emoji: '⚡',   name: 'Glimt',        description: '5 XP på én dag',     rarity: 'common' },
  { key: 'daily_50',    emoji: '🌟',   name: 'Gnist',        description: '50 XP på én dag',    rarity: 'common' },
  { key: 'daily_125',   emoji: '🔥',   name: 'Flamme',       description: '125 XP på én dag',   rarity: 'uncommon' },
  { key: 'daily_200',   emoji: '💥',   name: 'Eksplosjon',   description: '200 XP på én dag',   rarity: 'uncommon' },
  { key: 'daily_250',   emoji: '🚀',   name: 'Rakett',       description: '250 XP på én dag',   rarity: 'rare' },
  { key: 'daily_375',   emoji: '⚡🔥', name: 'Strøm',        description: '375 XP på én dag',   rarity: 'rare' },
  { key: 'daily_500',   emoji: '💎',   name: 'Diamantdag',   description: '500 XP på én dag',   rarity: 'epic' },
  { key: 'daily_750',   emoji: '🌠',   name: 'Stjerneskudd', description: '750 XP på én dag',   rarity: 'epic' },
  { key: 'daily_1000',  emoji: '👑⚡', name: 'Dagkonge',     description: '1 000 XP på én dag', rarity: 'legendary' },
  { key: 'daily_2500',  emoji: '⚜️👑', name: 'Viking-konge', description: '2 500 XP på én dag', rarity: 'legendary' },
  { key: 'daily_3000',  emoji: '🗡️⚜️', name: 'Viking-gud',  description: '3 000 XP på én dag', rarity: 'legendary' },
]

// ── League badges ───────────────────────────────────────────────────────────

const LEAGUE_EMOJI: Record<League, string> = {
  Bronze: '🥉', Silver: '🥈', Gold: '🥇', Platinum: '💜',
  Diamond: '💙', Elite: '🔥', Champion: '👑', Unreal: '⚡',
}

export const LEAGUE_ACHIEVEMENTS: Achievement[] = [
  { key: 'league_bronze',   emoji: '🥉', name: 'Bronse',    description: 'Nå Bronze league',   rarity: 'common' },
  { key: 'league_silver',   emoji: '🥈', name: 'Sølv',      description: 'Nå Silver league',   rarity: 'common' },
  { key: 'league_gold',     emoji: '🥇', name: 'Gull',      description: 'Nå Gold league',     rarity: 'uncommon' },
  { key: 'league_platinum', emoji: '💜', name: 'Platina',    description: 'Nå Platinum league', rarity: 'uncommon' },
  { key: 'league_diamond',  emoji: '💙', name: 'Diamant',    description: 'Nå Diamond league',  rarity: 'rare' },
  { key: 'league_elite',    emoji: '🔥', name: 'Elite',      description: 'Nå Elite league',    rarity: 'epic' },
  { key: 'league_champion', emoji: '👑', name: 'Champion',   description: 'Nå Champion league', rarity: 'epic' },
  { key: 'league_unreal_t', emoji: '⚡', name: 'Unreal',     description: 'Nå Unreal league',   rarity: 'legendary' },
]

export const ALL_ACHIEVEMENTS = [...ACHIEVEMENTS, ...DAILY_XP_ACHIEVEMENTS, ...LEAGUE_ACHIEVEMENTS]

export function getAchievement(key: string): Achievement | undefined {
  return ALL_ACHIEVEMENTS.find(a => a.key === key)
}

// ── Check which achievements a profile has earned ───────────────────────────
// Returns keys of newly earned achievements (not yet in earnedKeys set)

export interface ProfileStats {
  totalXp: number
  totalCorrectAnswers: number
  streakDays: number
  crownWins: number
  maxXpInDay: number
  // These come from xp_log aggregation (counted client-side from recent query)
  totalRounds: number
  perfectRounds: number
  consecutivePerfect: number
  friendCount: number
}

const LEAGUE_ORDER: League[] = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Elite', 'Champion', 'Unreal']

export function checkNewAchievements(
  stats: ProfileStats,
  earnedKeys: Set<string>,
): string[] {
  const newKeys: string[] = []

  function grant(key: string) {
    if (!earnedKeys.has(key)) newKeys.push(key)
  }

  // Milestone achievements
  if (stats.totalRounds >= 1)   grant('first_round')
  if (stats.perfectRounds >= 1) grant('perfect_round')
  if (stats.friendCount >= 1)   grant('first_friend')
  if (stats.totalRounds >= 10)  grant('rounds_10')

  if (stats.streakDays >= 3)    grant('streak_3')
  if (stats.crownWins >= 1)     grant('first_crown')
  if (stats.totalRounds >= 50)  grant('rounds_50')

  if (stats.consecutivePerfect >= 5) grant('perfect_5_row')
  if (stats.streakDays >= 7)    grant('streak_7')
  if (stats.crownWins >= 5)     grant('crown_5')
  // all_minigames checked separately (needs minigame type data)

  if (stats.totalRounds >= 100) grant('rounds_100')
  if (stats.streakDays >= 30)   grant('streak_30')
  if (stats.crownWins >= 25)    grant('crown_25')

  if (stats.totalRounds >= 500) grant('rounds_500')
  if (stats.perfectRounds >= 50) grant('perfect_50')
  if (stats.crownWins >= 50)    grant('crown_50')

  // League achievements
  const league = getLeague(stats.totalXp)
  const leagueIdx = LEAGUE_ORDER.indexOf(league)
  const leagueKeys = [
    'league_bronze', 'league_silver', 'league_gold', 'league_platinum',
    'league_diamond', 'league_elite', 'league_champion', 'league_unreal_t',
  ]
  for (let i = 0; i <= leagueIdx; i++) {
    grant(leagueKeys[i])
  }
  // Also the milestone ones from ACHIEVEMENTS list
  if (leagueIdx >= LEAGUE_ORDER.indexOf('Diamond')) grant('league_diamond')
  if (leagueIdx >= LEAGUE_ORDER.indexOf('Unreal'))  grant('league_unreal')

  // Daily XP record achievements
  const d = stats.maxXpInDay
  if (d >= 5)    grant('daily_5')
  if (d >= 50)   grant('daily_50')
  if (d >= 125)  grant('daily_125')
  if (d >= 200)  grant('daily_200')
  if (d >= 250)  grant('daily_250')
  if (d >= 375)  grant('daily_375')
  if (d >= 500)  grant('daily_500')
  if (d >= 750)  grant('daily_750')
  if (d >= 1000) grant('daily_1000')
  if (d >= 2500) grant('daily_2500')
  if (d >= 3000) grant('daily_3000')

  return newKeys
}
