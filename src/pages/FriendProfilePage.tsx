import { useState, useEffect } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/lib/auth/AuthContext'
import { getLeague, xpToNextLeague, LEAGUE_THRESHOLDS } from '@/lib/xp'
import { ACHIEVEMENTS, DAILY_XP_ACHIEVEMENTS, LEAGUE_ACHIEVEMENTS } from '@/lib/achievements'
import { AchievementGrid } from '@/components/game/AchievementBadge'
import AvatarPreview from '@/components/AvatarPreview'
import type { AvatarConfig } from '@/lib/avatar'
import type { Database } from '@/lib/supabase/client'

type ProfileRow = Database['public']['Tables']['profiles']['Row']

const LEAGUE_EMOJI: Record<string, string> = {
  Bronze: '🥉', Silver: '🥈', Gold: '🥇', Platinum: '💎',
  Diamond: '💠', Elite: '🔥', Champion: '👑', Unreal: '⚡',
}
const LEAGUE_LABEL: Record<string, string> = {
  Bronze: 'Bronse', Silver: 'Sølv', Gold: 'Gull', Platinum: 'Platina',
  Diamond: 'Diamant', Elite: 'Elite', Champion: 'Champion', Unreal: 'Unreal',
}

function avatarFromRow(row: ProfileRow): AvatarConfig {
  const c = row.avatar_config as Record<string, unknown>
  return {
    backgroundColor: (c.backgroundColor as string) ?? 'E8AC80',
    eyes:            (c.eyes as string)            ?? 'variant01',
    eyebrows:        (c.eyebrows as string)        ?? 'variant01',
    mouth:           (c.mouth as string)           ?? 'variant15',
    glasses:         (c.glasses as string | null)  ?? null,
  }
}

export default function FriendProfilePage() {
  const { userId } = useParams({ from: '/venner/$userId' })
  const { user } = useAuth()
  const navigate = useNavigate()

  const [profile, setProfile] = useState<ProfileRow | null>(null)
  const [earnedKeys, setEarnedKeys] = useState<Set<string>>(new Set())
  const [isFriend, setIsFriend] = useState<boolean | null>(null) // null = loading
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    loadAll()
  }, [user, userId])

  async function loadAll() {
    setLoading(true)

    // Check friendship
    const { data: friendship } = await supabase
      .from('friends')
      .select('id')
      .eq('status', 'accepted')
      .or(`and(requester_id.eq.${user!.id},receiver_id.eq.${userId}),and(requester_id.eq.${userId},receiver_id.eq.${user!.id})`)
      .maybeSingle()

    if (!friendship) {
      setIsFriend(false)
      setLoading(false)
      return
    }

    setIsFriend(true)

    // Fetch profile
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    setProfile(profileData ?? null)

    // Fetch earned achievements (allowed by RLS policy 002)
    const { data: earned } = await supabase
      .from('earned_achievements')
      .select('achievement_key')
      .eq('user_id', userId)

    setEarnedKeys(new Set((earned ?? []).map(r => r.achievement_key)))
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center">
        <p className="text-[var(--muted)] animate-pulse">Laster profil…</p>
      </div>
    )
  }

  if (!isFriend) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-5xl">🔒</p>
        <p className="text-white font-bold text-lg">Dere er ikke venner</p>
        <p className="text-[var(--muted)] text-sm">Du kan bare se profilen til venner.</p>
        <button
          onClick={() => navigate({ to: '/venner' })}
          className="mt-2 px-6 py-3 rounded-2xl bg-white/10 border border-white/20 text-white font-bold hover:bg-white/20 transition"
        >
          ← Tilbake til venner
        </button>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center">
        <p className="text-[var(--muted)]">Profil ikke funnet.</p>
      </div>
    )
  }

  const league = getLeague(profile.total_xp)
  const next = xpToNextLeague(profile.total_xp)
  const currentThreshold = LEAGUE_THRESHOLDS[league]
  const nextThreshold = next ? LEAGUE_THRESHOLDS[next.league] : currentThreshold + 1
  const progressRatio = Math.min(1, (profile.total_xp - currentThreshold) / (nextThreshold - currentThreshold))
  const avatarConfig = avatarFromRow(profile)

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[var(--bg)]"
         style={{ paddingTop: 'env(safe-area-inset-top)' }}>

      {/* Top bar */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <button
          onClick={() => navigate({ to: '/venner' })}
          className="flex items-center gap-1 text-[var(--muted)] text-sm font-semibold hover:text-white transition px-2 py-1"
        >
          ← Venner
        </button>
        <h1 className="text-lg font-black text-white">{profile.username}</h1>
        <div className="w-16" />
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-10 space-y-5">

        {/* ── Avatar + username ── */}
        <div className="flex flex-col items-center gap-3 pt-4">
          <AvatarPreview config={avatarConfig} size={120} />
          <div className="text-center">
            <p className="text-2xl font-black text-white">{profile.username}</p>
            <p className="text-[var(--muted)] text-sm mt-0.5">
              {LEAGUE_EMOJI[league]} {LEAGUE_LABEL[league]}
            </p>
          </div>
        </div>

        {/* ── Stats card ── */}
        <div className="rounded-3xl bg-white/5 border border-white/10 p-4 space-y-3">
          <h2 className="text-sm uppercase tracking-widest text-[var(--muted)]">Statistikk</h2>

          {/* League + XP bar */}
          <div className="flex items-center gap-3">
            <span className="text-3xl">{LEAGUE_EMOJI[league]}</span>
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-1">
                <span className="font-black text-white">Liga: {LEAGUE_LABEL[league]}</span>
                <span className="text-[var(--muted)]">{profile.total_xp.toLocaleString('nb-NO')} XP</span>
              </div>
              <div className="h-2.5 rounded-full bg-black/30 overflow-hidden">
                <div className="h-full rounded-full bg-purple-500 transition-all duration-700"
                     style={{ width: `${progressRatio * 100}%` }} />
              </div>
              {next && (
                <p className="text-xs text-[var(--muted)] mt-1 text-right">
                  {next.remaining.toLocaleString('nb-NO')} XP til {LEAGUE_LABEL[next.league]}
                </p>
              )}
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            {[
              { label: '🔥 Strekk',       value: profile.streak_days },
              { label: '👑 Krone-seier',  value: profile.crown_wins },
              { label: '✅ Riktige',      value: profile.total_correct_answers },
            ].map(s => (
              <div key={s.label} className="bg-black/20 rounded-2xl py-3 text-center">
                <p className="text-lg font-black text-white">{s.value}</p>
                <p className="text-xs text-white/50 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Achievements ── */}
        <div className="rounded-3xl bg-white/5 border border-white/10 p-4 space-y-4">
          <h2 className="text-xl uppercase tracking-widest text-[var(--muted)] text-center">Merker / Badges</h2>

          <div className="space-y-3">
            <p className="text-md text-[var(--muted)] font-bold text-center my-4">Milepæler</p>
            <AchievementGrid achievements={ACHIEVEMENTS} earnedKeys={earnedKeys} />
          </div>
          <div className="space-y-3">
            <p className="text-md text-[var(--muted)] font-bold text-center my-4">Daglig XP-rekord</p>
            <AchievementGrid achievements={DAILY_XP_ACHIEVEMENTS} earnedKeys={earnedKeys} />
          </div>
          <div className="space-y-3">
            <p className="text-md text-[var(--muted)] font-bold text-center my-4">Ligaer</p>
            <AchievementGrid achievements={LEAGUE_ACHIEVEMENTS} earnedKeys={earnedKeys} />
          </div>
        </div>

      </div>
    </div>
  )
}
