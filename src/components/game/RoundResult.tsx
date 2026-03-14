import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Database } from '@/lib/supabase/client'
import type { XpResult } from '@/lib/xp'
import { getLeague, xpToNextLeague, LEAGUE_THRESHOLDS } from '@/lib/xp'
import GameMenu from '@/components/layout/GameMenu'
import DifficultyCheck from './DifficultyCheck'
import VikingMessage from './VikingMessage'
import NewAchievements from './NewAchievements'

type ProfileRow = Database['public']['Tables']['profiles']['Row']

interface Props {
  profileBefore: ProfileRow
  profileAfter: ProfileRow
  xpResult: XpResult
  crownActive: boolean
  comebackJustActivated: boolean  // true if 0-correct + lucky roll this round
  newAchievementKeys?: string[]
  onPlayAgain: () => void
}

/** Returns true if total_correct_answers crossed a multiple of 15 this round */
function crossedDifficultyThreshold(before: number, after: number): boolean {
  return Math.floor(after / 15) > Math.floor(before / 15)
}

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
}

export default function RoundResult({
  profileBefore,
  profileAfter,
  xpResult,
  crownActive: _crownActive,
  comebackJustActivated,
  newAchievementKeys = [],
  onPlayAgain,
}: Props) {
  // Show full-screen comeback splash first, then dismiss to normal result
  const [comebackDismissed, setComebackDismissed] = useState(false)
  const [difficultyDone, setDifficultyDone] = useState(false)

  const isZero = xpResult.totalXp === 0
  const leagueAfter = getLeague(profileAfter.total_xp)
  const leagueBefore = getLeague(profileBefore.total_xp)
  const promoted = leagueAfter !== leagueBefore
  const next = xpToNextLeague(profileAfter.total_xp)

  const currentThreshold = LEAGUE_THRESHOLDS[leagueAfter]
  const isCloseToNext = next
    ? next.remaining < (LEAGUE_THRESHOLDS[next.league] - currentThreshold) * 0.20
    : false

  const showDifficulty = !difficultyDone && crossedDifficultyThreshold(
    profileBefore.total_correct_answers,
    profileAfter.total_correct_answers,
  )

  // Streak display
  const streakKept = profileAfter.streak_days >= profileBefore.streak_days && profileBefore.last_active_date !== null
  const streakIncreased = profileAfter.streak_days > profileBefore.streak_days

  return (
    <>
      {/* ── Full-screen comeback splash ────────────────────────────────── */}
      <AnimatePresence>
        {comebackJustActivated && !comebackDismissed && (
          <motion.div
            key="comeback"
            className="fixed inset-0 z-40 flex flex-col items-center justify-center p-8 text-center"
            style={{ background: 'linear-gradient(135deg, #78350f 0%, #1a0a00 60%, #0a0a0f 100%)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.35 }}
          >
            {/* Radiating glow */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{ background: 'radial-gradient(circle at 50% 40%, rgba(251,191,36,0.25) 0%, transparent 70%)' }}
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2, repeat: Infinity }}
            />

            <motion.p
              className="text-7xl mb-4"
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.3, 1] }}
              transition={{ type: 'spring', stiffness: 300, damping: 15 }}
            >⚡</motion.p>

            <motion.h1
              className="text-4xl font-black text-yellow-300 leading-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              EKSTRA SJANSE!
            </motion.h1>

            <motion.p
              className="mt-3 text-white font-bold text-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Neste runde gir <span className="text-yellow-300">+25% BONUS XP</span>!
            </motion.p>

            <motion.p
              className="mt-2 text-yellow-200/70 text-base"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              Men KUN om du spiller NÅ!
            </motion.p>

            <motion.button
              onClick={() => setComebackDismissed(true)}
              className="mt-10 px-10 py-4 rounded-2xl font-black text-xl text-black
                         bg-gradient-to-r from-yellow-400 to-orange-400
                         hover:from-yellow-300 hover:to-orange-300 active:scale-[0.97] transition-all
                         shadow-lg shadow-yellow-900/60"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
            >
              La oss gå! 🔥
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Normal result screen ───────────────────────────────────────── */}
      {(!comebackJustActivated || comebackDismissed) && (
        <motion.div
          className="min-h-[100dvh] flex flex-col items-center p-6 gap-5 text-center"
          style={{ paddingTop: 'max(env(safe-area-inset-top), 24px)', paddingBottom: 'max(env(safe-area-inset-bottom), 24px)' }}
          variants={stagger}
          initial="hidden"
          animate="show"
        >
          {/* Menu */}
          <motion.div variants={fadeUp} className="w-full flex justify-end">
            <GameMenu />
          </motion.div>

          {/* League promotion */}
          {promoted && (
            <motion.div
              variants={fadeUp}
              className="w-full max-w-sm rounded-3xl p-5 overflow-hidden relative"
              style={{ background: 'linear-gradient(135deg, rgba(147,51,234,0.4), rgba(245,158,11,0.3))' }}
            >
              <div className="absolute inset-0 border-2 border-yellow-400/60 rounded-3xl pointer-events-none" />
              <motion.p
                className="text-3xl font-black text-yellow-300"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >🏆 LIGA-OPPRYKK!</motion.p>
              <p className="text-white font-bold mt-1">
                Du er nå i <span className="text-yellow-300">{leagueAfter}</span>!
              </p>
            </motion.div>
          )}

          {/* Crown win */}
          {xpResult.isCrownWin && (
            <motion.p
              variants={fadeUp}
              className="text-5xl"
              animate={{ rotate: [-8, 8, -8] }}
              transition={{ duration: 2, repeat: Infinity }}
            >👑</motion.p>
          )}

          {/* Result header — viking mascot */}
          <motion.div variants={fadeUp} className="w-full flex justify-center">
            <VikingMessage state={isZero ? 'zero' : xpResult.isPerfect ? 'perfect' : 'normal'} />
          </motion.div>

          {/* XP earned */}
          {!isZero && (
            <motion.div
              variants={fadeUp}
              className="bg-white/10 border border-white/20 rounded-2xl px-8 py-4"
            >
              <motion.p
                className="text-5xl font-black text-yellow-300"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.2 }}
              >
                +{xpResult.totalXp} XP
              </motion.p>
              <div className="mt-2 text-sm text-[var(--muted)] space-y-0.5">
                <p>Base: {xpResult.baseXp} XP</p>
                {xpResult.skippedXp > 0 && <p>Hopp-XP: +{xpResult.skippedXp}</p>}
                {xpResult.multiplier > 1 && (
                  <p className="text-yellow-300">
                    Bonus ×{xpResult.multiplier.toFixed(2)}
                    {xpResult.isPerfect && ' · Perfekt'}
                    {xpResult.isCrownWin && ' · 👑 Crown'}
                    {xpResult.isComeback && ' · ⚡ Comeback'}
                  </p>
                )}
              </div>
            </motion.div>
          )}

          {/* Streak */}
          {profileAfter.streak_days > 0 && (
            <motion.div variants={fadeUp} className="flex items-center gap-2 text-orange-400 font-bold text-lg">
              🔥 {profileAfter.streak_days} dager på rad
              {streakIncreased && <span className="text-green-400 text-sm">+1</span>}
              {!streakKept && profileBefore.streak_days > 1 && (
                <span className="text-red-400 text-sm">(strekk brutt)</span>
              )}
            </motion.div>
          )}

          {/* New achievements */}
          {newAchievementKeys.length > 0 && (
            <motion.div variants={fadeUp} className="w-full max-w-sm">
              <NewAchievements newKeys={newAchievementKeys} />
            </motion.div>
          )}

          {/* Difficulty self-report */}
          {showDifficulty && (
            <motion.div variants={fadeUp} className="w-full max-w-sm">
              <DifficultyCheck
                userId={profileAfter.id}
                currentDifficulty={profileAfter.difficulty_level}
                totalXp={profileAfter.total_xp}
                onDone={() => setDifficultyDone(true)}
              />
            </motion.div>
          )}

          {/* "Nesten der!" hook */}
          {next && (
            <motion.div
              variants={fadeUp}
              className={`w-full max-w-sm rounded-2xl px-5 py-3 ${
                isCloseToNext
                  ? 'bg-purple-600/30 border-2 border-purple-400/60'
                  : 'bg-white/5 border border-white/10'
              }`}
            >
              {isCloseToNext ? (
                <motion.p
                  className="font-bold text-purple-200 text-lg"
                  animate={{ opacity: [1, 0.6, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  Du trenger bare <span className="text-white font-black">{next.remaining} XP</span> til {next.league}! 🔥
                </motion.p>
              ) : (
                <p className="font-bold text-[var(--muted)]">
                  Du trenger bare <span className="text-white font-black">{next.remaining} XP</span> til {next.league}! 🔥
                </p>
              )}
            </motion.div>
          )}

          {/* Play again */}
          <motion.button
            variants={fadeUp}
            onClick={onPlayAgain}
            className="mt-1 w-full max-w-sm py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-purple-500
                       text-white font-black text-xl hover:from-purple-500 hover:to-purple-400
                       active:scale-[0.98] transition-all shadow-lg shadow-purple-900/50"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            Spill igjen? 🎮
          </motion.button>
        </motion.div>
      )}
    </>
  )
}
