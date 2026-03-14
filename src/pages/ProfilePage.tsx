import { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/lib/auth/AuthContext'
import { getLeague, xpToNextLeague, LEAGUE_THRESHOLDS } from '@/lib/xp'
import { useAchievements } from '@/hooks/useAchievements'
import { ACHIEVEMENTS, DAILY_XP_ACHIEVEMENTS, LEAGUE_ACHIEVEMENTS } from '@/lib/achievements'
import { AchievementGrid } from '@/components/game/AchievementBadge'
import {
  EYES, EYEBROWS, MOUTH, GLASSES,
  SKIN_TONES, FUN_COLORS,
  cycleOption,
  type AvatarConfig,
} from '@/lib/avatar'
import AvatarPreview from '@/components/AvatarPreview'
import GameMenu from '@/components/layout/GameMenu'
import type { Database } from '@/lib/supabase/client'

type ProfileRow = Database['public']['Tables']['profiles']['Row']

const PASCAL_RE = /^[A-ZÆØÅ][a-zA-ZæøåÆØÅ0-9]{2,19}$/

function configFromRow(row: ProfileRow): AvatarConfig {
  const c = row.avatar_config as Record<string, unknown>
  return {
    backgroundColor: (c.backgroundColor as string) ?? 'E8AC80',
    eyes:            (c.eyes as string)            ?? 'variant01',
    eyebrows:        (c.eyebrows as string)        ?? 'variant01',
    mouth:           (c.mouth as string)           ?? 'variant15',
    glasses:         (c.glasses as string | null)  ?? null,
  }
}

function FeaturePicker({ label, value, options, onChange }: {
  label: string
  value: string | null
  options: (string | null)[]
  onChange: (v: string | null) => void
}) {
  const idx = options.indexOf(value)
  const total = options.length
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-[var(--muted)] w-24 shrink-0">{label}</span>
      <button type="button" onClick={() => onChange(cycleOption(options, value, -1))}
        className="w-9 h-9 rounded-lg border border-[var(--border)] flex items-center justify-center text-lg hover:border-[var(--accent)] transition-colors">‹</button>
      <span className="text-sm font-mono text-center w-16">
        {value ? `${idx + 1}/${total}` : 'Ingen'}
      </span>
      <button type="button" onClick={() => onChange(cycleOption(options, value, 1))}
        className="w-9 h-9 rounded-lg border border-[var(--border)] flex items-center justify-center text-lg hover:border-[var(--accent)] transition-colors">›</button>
    </div>
  )
}

export default function ProfilePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { earnedKeys, loading: achievementsLoading } = useAchievements(user?.id)

  const [profile, setProfile] = useState<ProfileRow | null>(null)
  const [loading, setLoading] = useState(true)

  // Avatar editing
  const [avatarConfig, setAvatarConfig] = useState<AvatarConfig | null>(null)
  const [avatarOpen, setAvatarOpen] = useState(false)
  const [savingAvatar, setSavingAvatar] = useState(false)
  const [avatarSaved, setAvatarSaved] = useState(false)

  // Username editing
  const [editingUsername, setEditingUsername] = useState(false)
  const [usernameValue, setUsernameValue] = useState('')
  const [usernameError, setUsernameError] = useState<string | null>(null)
  const [checkingUsername, setCheckingUsername] = useState(false)
  const [savingUsername, setSavingUsername] = useState(false)

  // Delete account
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
      .then(({ data }) => {
        if (data) {
          setProfile(data)
          setAvatarConfig(configFromRow(data))
          setUsernameValue(data.username)
        }
        setLoading(false)
      })
  }, [user])

  const updateAvatar = (patch: Partial<AvatarConfig>) =>
    setAvatarConfig(prev => prev ? { ...prev, ...patch } : prev)

  async function saveAvatar() {
    if (!user || !avatarConfig) return
    setSavingAvatar(true)
    await supabase.from('profiles').update({ avatar_config: avatarConfig }).eq('id', user.id)
    setProfile(p => p ? { ...p, avatar_config: avatarConfig as unknown as Record<string, unknown> } : p)
    setSavingAvatar(false)
    setAvatarSaved(true)
    setAvatarOpen(false)
    setTimeout(() => setAvatarSaved(false), 2500)
  }

  async function validateUsername(value: string): Promise<string | null> {
    if (!PASCAL_RE.test(value)) return 'Brukernavn må starte med stor bokstav, 3–20 tegn.'
    setCheckingUsername(true)
    const { data } = await supabase.from('profiles').select('username').eq('username', value).maybeSingle()
    setCheckingUsername(false)
    if (data && data.username !== profile?.username) return 'Brukernavnet er tatt.'
    return null
  }

  async function saveUsername() {
    const err = await validateUsername(usernameValue)
    if (err) { setUsernameError(err); return }
    setSavingUsername(true)
    await supabase.from('profiles').update({ username: usernameValue }).eq('id', user!.id)
    setProfile(p => p ? { ...p, username: usernameValue } : p)
    setSavingUsername(false)
    setEditingUsername(false)
    setUsernameError(null)
  }

  if (loading || !profile || !avatarConfig) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center">
        <p className="text-[var(--muted)] animate-pulse">Laster profil…</p>
      </div>
    )
  }

  const league = getLeague(profile.total_xp)
  const next = xpToNextLeague(profile.total_xp)
  const currentThreshold = LEAGUE_THRESHOLDS[league]
  const nextThreshold = next ? LEAGUE_THRESHOLDS[next.league] : currentThreshold + 1
  const progressRatio = Math.min(1, (profile.total_xp - currentThreshold) / (nextThreshold - currentThreshold))

  const leagueEmoji: Record<string, string> = {
    Bronze: '🥉', Silver: '🥈', Gold: '🥇', Platinum: '💎',
    Diamond: '💠', Elite: '🔥', Champion: '👑', Unreal: '⚡',
  }
  const leagueLabel: Record<string, string> = {
    Bronze: 'Bronse', Silver: 'Sølv', Gold: 'Gull', Platinum: 'Platina',
    Diamond: 'Diamant', Elite: 'Elite', Champion: 'Champion', Unreal: 'Unreal',
  }

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[var(--bg)]"
         style={{ paddingTop: 'env(safe-area-inset-top)' }}>

      {/* Top bar */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <button onClick={() => navigate({ to: '/spill' })}
          className="flex items-center gap-1 text-[var(--muted)] text-sm font-semibold hover:text-white transition px-2 py-1">
          ← Spill
        </button>
        <h1 className="text-lg font-black text-white">Min profil</h1>
        <GameMenu />
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-10 space-y-5">

        {/* ── Avatar + username hero ── */}
        <div className="flex flex-col items-center gap-3 pt-4">
          {/* Avatar */}
          <button
            onClick={() => setAvatarOpen(o => !o)}
            className="relative group"
            aria-label="Endre avatar"
          >
            <AvatarPreview config={avatarConfig} size={120} />
            <span className="absolute inset-0 flex items-center justify-center
                             rounded-full bg-black/50 opacity-0 group-hover:opacity-100
                             transition-opacity text-2xl">
              ✏️
            </span>
          </button>

          {avatarSaved && (
            <p className="text-green-400 text-sm font-semibold animate-pulse">Avatar lagret ✓</p>
          )}

          {/* Username */}
          {editingUsername ? (
            <div className="flex flex-col items-center gap-2 w-full max-w-xs">
              <input
                value={usernameValue}
                onChange={e => { setUsernameValue(e.target.value); setUsernameError(null) }}
                onKeyDown={e => { if (e.key === 'Enter') saveUsername() }}
                className="w-full text-center text-xl font-black bg-white/10 border-2 border-purple-400/50
                           rounded-2xl px-4 py-2 text-white focus:outline-none focus:border-purple-400"
                maxLength={20}
                autoFocus
              />
              {usernameError && <p className="text-red-400 text-sm">{usernameError}</p>}
              <div className="flex gap-2 w-full">
                <button onClick={() => { setEditingUsername(false); setUsernameValue(profile.username); setUsernameError(null) }}
                  className="flex-1 py-2 rounded-xl bg-white/10 text-[var(--muted)] text-sm font-bold hover:bg-white/20 transition">
                  Avbryt
                </button>
                <button onClick={saveUsername} disabled={savingUsername || checkingUsername}
                  className="flex-1 py-2 rounded-xl bg-purple-600 text-white text-sm font-black hover:bg-purple-500 transition disabled:opacity-50">
                  {savingUsername || checkingUsername ? 'Lagrer…' : 'Lagre'}
                              </button>
              </div>
            </div>
          ) : (
            <button onClick={() => setEditingUsername(true)}
              className="flex items-center gap-2 group">
              <span className="text-2xl font-black text-white">{profile.username}</span>
              <span className="text-[var(--muted)] text-base group-hover:text-white transition">✏️</span>
            </button>
          )}
        </div>

        {/* ── Avatar editor (expandable) ── */}
        {avatarOpen && (
          <div className="rounded-3xl bg-white/5 border border-white/10 p-4 space-y-4">
            <h2 className="text-sm uppercase tracking-widest text-[var(--muted)] text-center">Endre avatar</h2>

            {/* Background color */}
            <div>
              <p className="text-xs text-[var(--muted)] mb-2">Hudtone / bakgrunn</p>
              <div className="flex flex-wrap gap-2">
                {[...SKIN_TONES, ...FUN_COLORS].map(c => (
                  <button key={c.hex} type="button"
                    onClick={() => updateAvatar({ backgroundColor: c.hex })}
                    style={{
                      background: `#${c.hex}`, width: 34, height: 34, borderRadius: '50%',
                      border: avatarConfig.backgroundColor === c.hex ? '3px solid var(--accent)' : '3px solid transparent',
                      boxShadow: avatarConfig.backgroundColor === c.hex ? '0 0 8px rgba(168,85,247,0.7)' : 'none',
                    }}
                    title={c.label}
                  />
                ))}
              </div>
            </div>

            {/* Feature pickers */}
            <div className="space-y-3">
              <FeaturePicker label="Øyne"    value={avatarConfig.eyes}     options={EYES}     onChange={v => updateAvatar({ eyes: v ?? 'variant01' })} />
              <FeaturePicker label="Øyenbryn" value={avatarConfig.eyebrows} options={EYEBROWS}  onChange={v => updateAvatar({ eyebrows: v ?? 'variant01' })} />
              <FeaturePicker label="Munn"    value={avatarConfig.mouth}    options={MOUTH}    onChange={v => updateAvatar({ mouth: v ?? 'variant01' })} />
              <FeaturePicker label="Briller" value={avatarConfig.glasses}  options={GLASSES}  onChange={v => updateAvatar({ glasses: v })} />
            </div>

            <button onClick={saveAvatar} disabled={savingAvatar}
              className="w-full py-3 rounded-2xl bg-purple-600 text-white font-black text-base
                         hover:bg-purple-500 active:scale-95 transition disabled:opacity-50">
              {savingAvatar ? 'Lagrer…' : 'Lagre avatar ✓'}
            </button>
          </div>
        )}

        {/* ── Stats card ── */}
        <div className="rounded-3xl bg-white/5 border border-white/10 p-4 space-y-3">
          <h2 className="text-sm uppercase tracking-widest text-[var(--muted)]">Statistikk</h2>

          {/* League + XP bar */}
          <div className="flex items-center gap-3">
            <span className="text-3xl">{leagueEmoji[league]}</span>
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-1">
                <span className="font-black text-white">Liga: {leagueLabel[league]}</span>
                <span className="text-[var(--muted)]">{profile.total_xp.toLocaleString('nb-NO')} XP</span>
              </div>
              <div className="h-2.5 rounded-full bg-black/30 overflow-hidden">
                <div className="h-full rounded-full bg-purple-500 transition-all duration-700"
                     style={{ width: `${progressRatio * 100}%` }} />
              </div>
              {next && (
                <p className="text-xs text-[var(--muted)] mt-1 text-right">
                  {next.remaining.toLocaleString('nb-NO')} XP til {leagueLabel[next.league]}
                </p>
              )}
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            {[
              { label: '🔥 Strekk', value: profile.streak_days },
              { label: '👑 Krone-seier', value: profile.crown_wins },
              { label: '✅ Riktige', value: profile.total_correct_answers },
              { label: '⚡ Hjelpemiddel', value: profile.skip_tokens },
              { label: '🛡️ Skjold', value: `${profile.streak_shield_days}d` },
              { label: '💎 Nivå', value: profile.difficulty_level },
            ].map(s => (
              <div key={s.label} className="bg-black/20 rounded-2xl py-3 text-center">
                <p className="text-lg font-black text-white">{s.value}</p>
                <p className="text-xs text-white/50 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Achievements ── */}
        {!achievementsLoading && (
          <div className="rounded-3xl bg-white/5 border border-white/10 p-4 space-y-4">
            <h2 className="text-lg uppercase tracking-widest text-[var(--muted)] text-center">Merker / Badges</h2>

            <div className="space-y-3">
              <p className="text-md text-[var(--muted)] font-bold text-center">Milepæler</p>
              <AchievementGrid achievements={ACHIEVEMENTS} earnedKeys={earnedKeys} />
            </div>

            <div className="space-y-3">
              <p className="text-md text-[var(--muted)] font-bold text-center">Daglig XP-rekord</p>
              <AchievementGrid achievements={DAILY_XP_ACHIEVEMENTS} earnedKeys={earnedKeys} />
            </div>

            <div className="space-y-3">
              <p className="text-md text-[var(--muted)] font-bold text-center">Ligaer</p>
              <AchievementGrid achievements={LEAGUE_ACHIEVEMENTS} earnedKeys={earnedKeys} />
            </div>
          </div>
        )}

        {/* ── Sign out ── */}
        <button
          onClick={async () => { await supabase.auth.signOut(); navigate({ to: '/logg-inn' }) }}
          className="w-full py-3 rounded-2xl bg-white/5 border border-white/10 text-[var(--muted)]
                     text-sm font-bold hover:bg-red-900/20 hover:border-red-500/30 hover:text-red-400
                     transition-all active:scale-95"
        >
          Logg ut
        </button>

        {/* ── Delete account (buried) ── */}
        <button
          onClick={() => { setDeleteOpen(true); setDeleteConfirm(''); setDeleteError(null) }}
          className="w-full py-2 text-white/20 text-xs hover:text-red-500/60 transition-colors"
        >
          Slett konto
        </button>

      </div>

      {/* ── Delete account confirmation sheet ── */}
      {deleteOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/70"
            onClick={() => !deleting && setDeleteOpen(false)}
          />
          <div className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl bg-[#111] border-t border-white/10 px-5 pb-10 pt-6"
               style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 40px)' }}>

            <div className="flex flex-col items-center gap-1 mb-5">
              <p className="text-3xl">⚠️</p>
              <h2 className="text-white font-black text-xl">Slett konto</h2>
              <p className="text-[var(--muted)] text-sm text-center">
                Dette sletter all din data permanent — XP, merker, venner, alt.
                Det kan ikke angres.
              </p>
            </div>

            <p className="text-xs text-[var(--muted)] mb-2">
              Skriv brukernavnet ditt (<span className="text-white font-bold">{profile.username}</span>) for å bekrefte:
            </p>
            <input
              value={deleteConfirm}
              onChange={e => { setDeleteConfirm(e.target.value); setDeleteError(null) }}
              placeholder={profile.username}
              disabled={deleting}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3
                         text-white placeholder:text-white/20 focus:outline-none focus:border-red-400
                         text-base mb-3"
              autoCapitalize="none"
            />

            {deleteError && (
              <p className="text-red-400 text-sm mb-3 text-center">{deleteError}</p>
            )}

            <button
              disabled={deleteConfirm !== profile.username || deleting}
              onClick={async () => {
                setDeleting(true)
                setDeleteError(null)
                const { error } = await supabase.functions.invoke('delete-account')
                if (error) {
                  setDeleteError('Noe gikk galt. Prøv igjen.')
                  setDeleting(false)
                  return
                }
                await supabase.auth.signOut()
                navigate({ to: '/logg-inn' })
              }}
              className="w-full py-3 rounded-2xl bg-red-700 text-white font-black text-base
                         hover:bg-red-600 active:scale-95 transition-all
                         disabled:opacity-30 disabled:cursor-not-allowed mb-2"
            >
              {deleting ? 'Sletter…' : 'Slett kontoen min for alltid'}
            </button>

            <button
              onClick={() => setDeleteOpen(false)}
              disabled={deleting}
              className="w-full py-3 text-[var(--muted)] text-sm font-bold hover:text-white transition"
            >
              Avbryt
            </button>
          </div>
        </>
      )}

    </div>
  )
}

