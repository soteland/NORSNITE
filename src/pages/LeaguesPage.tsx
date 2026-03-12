import { useEffect, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/lib/auth/AuthContext'
import { getLeague, xpToNextLeague, LEAGUE_THRESHOLDS, LEAGUES, type League } from '@/lib/xp'
import type { Database } from '@/lib/supabase/client'
import GameMenu from '@/components/layout/GameMenu'
import { getCurrentMonthSplash } from '@/lib/splashscreen'

type ProfileRow = Database['public']['Tables']['profiles']['Row']

interface LeagueStyle {
  color: string
  bg: string
  border: string
  emoji: string
  label: string
}

const LEAGUE_STYLE: Record<League, LeagueStyle> = {
  Bronze:   { color: '#cd7f32', bg: 'from-amber-900/50 to-amber-800/20',  border: 'border-amber-700/60',   emoji: '🥉', label: 'Bronse'   },
  Silver:   { color: '#c0c0c0', bg: 'from-slate-500/50 to-slate-600/20',  border: 'border-slate-400/60',   emoji: '🥈', label: 'Sølv'     },
  Gold:     { color: '#ffd700', bg: 'from-yellow-500/50 to-yellow-600/20', border: 'border-yellow-400/60',  emoji: '🥇', label: 'Gull'     },
  Platinum: { color: '#e2e8f0', bg: 'from-cyan-700/50 to-cyan-800/20',    border: 'border-cyan-400/60',    emoji: '💎', label: 'Platina'  },
  Diamond:  { color: '#7dd3fc', bg: 'from-sky-600/50 to-sky-700/20',      border: 'border-sky-400/60',     emoji: '💠', label: 'Diamant'  },
  Elite:    { color: '#f87171', bg: 'from-red-600/50 to-red-700/20',      border: 'border-red-400/60',     emoji: '🔥', label: 'Elite'    },
  Champion: { color: '#c084fc', bg: 'from-purple-600/50 to-purple-700/20', border: 'border-purple-400/60', emoji: '👑', label: 'Champion' },
  Unreal:   { color: '#fbbf24', bg: 'from-yellow-500/50 to-orange-600/20', border: 'border-yellow-300/60', emoji: '⚡', label: 'Unreal'   },
}

export default function LeaguesPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState<ProfileRow | null>(null)
    const [loading, setLoading] = useState(true)
    
  const { src, month } = getCurrentMonthSplash()

  useEffect(() => {
    if (!user) return
    supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
      .then(({ data }) => { setProfile(data); setLoading(false) })
  }, [user])

  const currentLeague = profile ? getLeague(profile.total_xp) : 'Bronze'
  const currentIdx = LEAGUES.indexOf(currentLeague)
  const next = profile ? xpToNextLeague(profile.total_xp) : null
  const style = LEAGUE_STYLE[currentLeague]

  // Progress within current league (0–1)
  const currentThreshold = LEAGUE_THRESHOLDS[currentLeague]
  const nextThreshold = next ? LEAGUE_THRESHOLDS[next.league] : LEAGUE_THRESHOLDS[currentLeague] + 1
  const progressRatio = profile
    ? Math.min(1, (profile.total_xp - currentThreshold) / (nextThreshold - currentThreshold))
    : 0

  return (
    <div
      className="min-h-[100dvh] flex flex-col bg-[var(--bg)]"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <button
          onClick={() => navigate({ to: '/spill' })}
          className="flex items-center gap-1 text-[var(--muted)] text-sm font-semibold
                     hover:text-white transition px-2 py-1"
        >
          ← Spill
        </button>
        <h1 className="text-lg font-black text-white">Ligaer</h1>
        <GameMenu />
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-4">

        {loading && (
          <div className="flex justify-center pt-16">
            <p className="text-[var(--muted)] animate-pulse">Laster…</p>
          </div>
        )}

        {!loading && profile && (
          <>
            {/* ── Current league hero card ── */}
            <div className={`rounded-3xl bg-gradient-to-br ${style.bg} border-2 ${style.border} p-6`}>
              <div className="flex items-center gap-4 mb-4">
                <span className="text-6xl">{style.emoji}</span>
                <div>
                  <p className="text-xs uppercase tracking-widest text-white/60">Din liga</p>
                  <p className="text-3xl font-black text-white">{style.label}</p>
                </div>
              </div>

              <div className="space-y-1 mb-4">
                <div className="flex justify-between text-sm text-white/70">
                  <span>{profile.total_xp.toLocaleString('nb-NO')} XP totalt</span>
                  {next && <span>{next.remaining.toLocaleString('nb-NO')} XP til {LEAGUE_STYLE[next.league].label}</span>}
                  {!next && <span>Maksimal liga! 🌟</span>}
                </div>
                <div className="h-3 rounded-full bg-black/30 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${progressRatio * 100}%`,
                      backgroundColor: style.color,
                      boxShadow: `0 0 8px ${style.color}80`,
                    }}
                  />
                </div>
              </div>

              {/* Stats row */}
              <div className="flex gap-4 text-center">
                <div className="flex-1 bg-black/20 rounded-2xl py-2">
                  <p className="text-xl font-black text-white">{profile.streak_days}</p>
                  <p className="text-xs text-white/60">🔥 Strekk</p>
                </div>
                <div className="flex-1 bg-black/20 rounded-2xl py-2">
                  <p className="text-xl font-black text-white">{profile.crown_wins}</p>
                  <p className="text-xs text-white/60">👑 Crown</p>
                </div>
                <div className="flex-1 bg-black/20 rounded-2xl py-2">
                  <p className="text-xl font-black text-white">{profile.total_correct_answers}</p>
                  <p className="text-xs text-white/60">✅ Riktige</p>
                </div>
              </div>
            </div>

            {/* ── All leagues list ── */}
            <h2 className="text-sm uppercase tracking-widest text-[var(--muted)] pt-2 px-1">
              Alle ligaer
            </h2>

            <div className="space-y-2">
              {LEAGUES.map((league, idx) => {
                const s = LEAGUE_STYLE[league]
                const isCurrent = league === currentLeague
                const isCompleted = idx < currentIdx
                const threshold = LEAGUE_THRESHOLDS[league]

                return (
                  <div
                    key={league}
                    className={`flex items-center gap-4 px-4 py-3 rounded-2xl border transition
                      ${isCurrent
                        ? `bg-gradient-to-r ${s.bg} border-2 ${s.border}`
                        : isCompleted
                          ? 'bg-white/5 border-white/10'
                          : 'bg-white/[0.02] border-white/5 opacity-50'
                      }`}
                  >
                    {/* Emoji */}
                    <span className={`text-3xl ${!isCurrent && !isCompleted ? 'grayscale' : ''}`}>
                      {s.emoji}
                    </span>

                    {/* Name + threshold */}
                    <div className="flex-1 min-w-0">
                      <p className={`font-black text-base ${isCurrent ? 'text-white' : isCompleted ? 'text-white/80' : 'text-white/40'}`}>
                        {s.label}
                      </p>
                      <p className="text-xs text-white/40">
                        {threshold === 0 ? 'Startpunkt' : `${threshold.toLocaleString('nb-NO')} XP`}
                      </p>
                    </div>

                    {/* Status badge */}
                    <div className="flex-shrink-0">
                      {isCurrent && (
                        <span className="text-xs font-bold px-2 py-1 rounded-full"
                              style={{ backgroundColor: `${s.color}30`, color: s.color }}>
                          Din liga
                        </span>
                      )}
                      {isCompleted && (
                        <span className="text-green-400 text-lg">✓</span>
                      )}
                      {!isCurrent && !isCompleted && (
                        <span className="text-white/30 text-lg">🔒</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
          </div>
          {/* Centered month logo here, just like from the splash screen  */}
          <div className="flex justify-center mt-4">
             
            <img src={src} alt={`Norsnite Logo - ${month}`} className="w-full max-w-[800px] rounded-lg" />
          </div>
    </div>
  )
}
