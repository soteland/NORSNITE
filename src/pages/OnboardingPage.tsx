import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase/client'
import { generateUsername } from '@/lib/username'
import { useAuth } from '@/lib/auth/AuthContext'
import {
  EYES, EYEBROWS, MOUTH, GLASSES,
  SKIN_TONES, FUN_COLORS,
  DEFAULT_AVATAR_CONFIG, cycleOption,
  type AvatarConfig,
} from '@/lib/avatar'
import AvatarPreview from '@/components/AvatarPreview'

// ── League display for rules slide ───────────────────────────────────────────
const LEAGUES_DISPLAY = [
  { name: 'Bronse',   emoji: '🥉', color: '#cd7f32' },
  { name: 'Sølv',    emoji: '🥈', color: '#aaaaaa' },
  { name: 'Gull',    emoji: '🥇', color: '#f59e0b' },
  { name: 'Platina', emoji: '💜', color: '#a855f7' },
  { name: 'Diamant', emoji: '💙', color: '#3b82f6' },
  { name: 'Elite',   emoji: '🔥', color: '#ef4444' },
  { name: 'Champion',emoji: '👑', color: '#f59e0b' },
  { name: 'Unreal',  emoji: '⚡', color: '#06b6d4' },
]

// ── PascalCase username validation ────────────────────────────────────────────
const PASCAL_RE = /^[A-ZÆØÅ][a-zA-ZæøåÆØÅ0-9]{2,19}$/

// ── Slide animation variants ──────────────────────────────────────────────────
const slideVariants = {
  enter: (dir: number) => ({ x: dir * 40, opacity: 0 }),
  center:              ({ x: 0,      opacity: 1 }),
  exit:  (dir: number) => ({ x: dir * -40, opacity: 0 }),
}

// ── Cycling feature picker ────────────────────────────────────────────────────
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
      <button
        type="button"
        onClick={() => onChange(cycleOption(options, value, -1))}
        className="w-9 h-9 rounded-lg border border-[var(--border)] flex items-center justify-center text-lg hover:border-[var(--accent)] transition-colors"
        aria-label={`Forrige ${label}`}
      >‹</button>
      <span className="text-sm font-mono text-center w-16">
        {value ? `${idx + 1}/${total}` : 'Ingen'}
      </span>
      <button
        type="button"
        onClick={() => onChange(cycleOption(options, value, 1))}
        className="w-9 h-9 rounded-lg border border-[var(--border)] flex items-center justify-center text-lg hover:border-[var(--accent)] transition-colors"
        aria-label={`Neste ${label}`}
      >›</button>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
export default function OnboardingPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [slideDir, setSlideDir] = useState(1)
  const [rulesSlide, setRulesSlide] = useState<1 | 2>(1)

  // Username state
  const [username, setUsername] = useState('')
  const [usernameError, setUsernameError] = useState<string | null>(null)
  const [isCheckingUsername, setIsCheckingUsername] = useState(false)

  // Avatar state
  const [avatarConfig, setAvatarConfig] = useState<AvatarConfig>(DEFAULT_AVATAR_CONFIG)

  const [submitting, setSubmitting] = useState(false)

  // On mount: check if profile exists → skip onboarding
  useEffect(() => {
    if (!user) return
    supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) navigate({ to: '/' })
        else setUsername(generateUsername())
      })
  }, [user, navigate])

  // ── Username validation & uniqueness check ──────────────────────────────────
  const validateUsername = useCallback(async (value: string): Promise<boolean> => {
    if (!PASCAL_RE.test(value)) {
      setUsernameError('Brukernavnet må starte med stor bokstav og bare inneholde bokstaver og tall (3–20 tegn).')
      return false
    }
    setIsCheckingUsername(true)
    setUsernameError(null)
    try {
      const { data } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', value)
        .maybeSingle()
      if (data) {
        setUsernameError('Det brukernavnet er allerede tatt — prøv et annet!')
        return false
      }
      return true
    } finally {
      setIsCheckingUsername(false)
    }
  }, [])

  const goToStep2 = async () => {
    const ok = await validateUsername(username)
    if (!ok) return
    goForward(2)
  }

  // ── Navigation helpers ──────────────────────────────────────────────────────
  const goForward = (next: 1 | 2 | 3) => {
    setSlideDir(1)
    setStep(next)
  }
  const goBack = (prev: 1 | 2 | 3) => {
    setSlideDir(-1)
    setStep(prev)
  }

  // ── Final submission ────────────────────────────────────────────────────────
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleComplete = async () => {
    setSubmitError(null)

    // Re-fetch session in case AuthContext hasn't hydrated yet
    let uid = user?.id
    if (!uid) {
      const { data: { session } } = await supabase.auth.getSession()
      uid = session?.user?.id
    }
    if (!uid) {
      setSubmitError('Sesjonen din er utløpt. Last siden på nytt og logg inn igjen.')
      return
    }

    setSubmitting(true)
    const { error } = await supabase.from('profiles').insert({
      id: uid,
      username,
      avatar_config: avatarConfig,
    })
    setSubmitting(false)

    if (error) {
      console.error('[OnboardingPage] profile insert error:', error)
      if (error.code === '23505') {
        // Unique violation — username taken (race condition)
        setStep(1)
        setSlideDir(-1)
        setUsernameError('Det brukernavnet ble akkurat tatt — prøv et annet!')
      } else {
        setSubmitError(`Kunne ikke lagre profil: ${error.message}`)
      }
      return
    }

    navigate({ to: '/spill' })
  }

  const updateAvatar = (patch: Partial<AvatarConfig>) =>
    setAvatarConfig(prev => ({ ...prev, ...patch }))

  // ── Step 1: Username ────────────────────────────────────────────────────────
  const step1 = (
    <motion.div
      key="step1"
      custom={slideDir}
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="flex flex-col gap-6"
    >
      <div className="text-center">
        <div className="text-5xl mb-3">🎮</div>
        <h2 className="text-2xl font-black">Hei! Velkommen til NorsNite!</h2>
        <p className="text-[var(--muted)] mt-2 text-sm">Vi har laget et brukernavn til deg.</p>
      </div>

      <div className="rounded-xl border border-[var(--border)] p-4" style={{ background: 'var(--bg)' }}>
        <p className="text-xs text-[var(--muted)] mb-1">Brukernavnet ditt</p>
        <input
          className="auth-input font-bold text-lg"
          value={username}
          onChange={e => { setUsername(e.target.value); setUsernameError(null) }}
          placeholder="FlytendeHest42"
          maxLength={20}
          autoCapitalize="words"
          autoCorrect="off"
          spellCheck={false}
        />
        {usernameError && (
          <p className="text-[var(--danger)] text-sm mt-2">{usernameError}</p>
        )}
        <p className="text-[var(--muted)] text-xs mt-2">
          Du kan endre brukernavnet én gang senere. Bare bokstaver og tall, starter med stor bokstav.
        </p>
      </div>

      <button
        type="button"
        onClick={goToStep2}
        disabled={isCheckingUsername || !username}
        className="btn-primary"
      >
        {isCheckingUsername ? 'Sjekker…' : 'Behold dette brukernavnet →'}
      </button>
    </motion.div>
  )

  // ── Step 2: Avatar ──────────────────────────────────────────────────────────
  const step2 = (
    <motion.div
      key="step2"
      custom={slideDir}
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="flex flex-col gap-5"
    >
      <div className="text-center">
        <h2 className="text-2xl font-black">Lag avataren din 🧑‍🎨</h2>
        <p className="text-[var(--muted)] text-sm mt-1">Velg utseende — du kan endre dette i profilen din.</p>
      </div>

      {/* Avatar preview */}
      <div className="flex justify-center">
        <div className="rounded-full border-4 border-[var(--accent)] p-1" style={{ boxShadow: '0 0 20px rgba(168,85,247,0.4)' }}>
          <AvatarPreview config={avatarConfig} size={140} />
        </div>
      </div>

      {/* Color picker */}
      <div className="rounded-xl border border-[var(--border)] p-4 flex flex-col gap-3" style={{ background: 'var(--bg)' }}>
        <p className="text-xs text-[var(--muted)] font-semibold uppercase tracking-wide">Farge</p>
        <div className="flex flex-col gap-2">
          <p className="text-xs text-[var(--muted)]">Hudtoner</p>
          <div className="flex gap-2 flex-wrap">
            {SKIN_TONES.map(c => (
              <button
                key={c.hex}
                type="button"
                title={c.label}
                onClick={() => updateAvatar({ backgroundColor: c.hex })}
                style={{ background: `#${c.hex}`, width: 36, height: 36, borderRadius: '50%', border: avatarConfig.backgroundColor === c.hex ? '3px solid var(--accent)' : '3px solid transparent', boxShadow: avatarConfig.backgroundColor === c.hex ? '0 0 8px rgba(168,85,247,0.7)' : 'none' }}
                aria-label={c.label}
              />
            ))}
          </div>
          <p className="text-xs text-[var(--muted)] mt-1">Morsomme farger</p>
          <div className="flex gap-2 flex-wrap">
            {FUN_COLORS.map(c => (
              <button
                key={c.hex}
                type="button"
                title={c.label}
                onClick={() => updateAvatar({ backgroundColor: c.hex })}
                style={{ background: `#${c.hex}`, width: 36, height: 36, borderRadius: '50%', border: avatarConfig.backgroundColor === c.hex ? '3px solid var(--accent)' : '3px solid transparent', boxShadow: avatarConfig.backgroundColor === c.hex ? '0 0 8px rgba(168,85,247,0.7)' : 'none' }}
                aria-label={c.label}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Feature pickers */}
      <div className="rounded-xl border border-[var(--border)] p-4 flex flex-col gap-3" style={{ background: 'var(--bg)' }}>
        <p className="text-xs text-[var(--muted)] font-semibold uppercase tracking-wide">Trekk</p>
        <FeaturePicker label="Øyne" value={avatarConfig.eyes} options={EYES} onChange={v => updateAvatar({ eyes: v ?? 'variant01' })} />
        <FeaturePicker label="Øyenbryn" value={avatarConfig.eyebrows} options={EYEBROWS} onChange={v => updateAvatar({ eyebrows: v ?? 'variant01' })} />
        <FeaturePicker label="Munn" value={avatarConfig.mouth} options={MOUTH} onChange={v => updateAvatar({ mouth: v ?? 'variant01' })} />
        <FeaturePicker label="Briller" value={avatarConfig.glasses} options={GLASSES} onChange={v => updateAvatar({ glasses: v })} />
      </div>

      <div className="flex gap-3">
        <button type="button" onClick={() => goBack(1)} className="btn-secondary w-auto px-5">← Tilbake</button>
        <button type="button" onClick={() => goForward(3)} className="btn-primary">Neste →</button>
      </div>
    </motion.div>
  )

  // ── Step 3: Rules ───────────────────────────────────────────────────────────
  const step3 = (
    <motion.div
      key="step3"
      custom={slideDir}
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="flex flex-col gap-5"
    >
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black">Slik spiller du 🏆</h2>
        <button type="button" onClick={handleComplete} disabled={submitting} className="text-[var(--muted)] text-sm hover:text-[var(--accent)] transition-colors">
          Hopp over
        </button>
      </div>

      <AnimatePresence mode="wait" custom={1}>
        {rulesSlide === 1 ? (
          <motion.div
            key="rules1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-4"
          >
            <div className="rounded-xl border border-[var(--border)] p-5 flex flex-col gap-3" style={{ background: 'var(--bg)' }}>
              <div className="flex items-start gap-3">
                <span className="text-3xl">⭐</span>
                <div>
                  <p className="font-bold text-lg">Tjen XP!</p>
                  <p className="text-[var(--muted)] text-sm mt-1">Svar riktig på spørsmål for å tjene XP. Perfekt runde? <strong className="text-[var(--gold)]">+25% bonus!</strong> Vinn med krone? <strong className="text-[var(--gold)]">+50% bonus!</strong></p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-[var(--border)] p-5 flex flex-col gap-3" style={{ background: 'var(--bg)' }}>
              <div className="flex items-start gap-3">
                <span className="text-3xl">🔥</span>
                <div>
                  <p className="font-bold text-lg">Hold strekken!</p>
                  <p className="text-[var(--muted)] text-sm mt-1">Spill hver dag for å bygge opp strekken din. Jo lenger strekk, jo kulere du er!</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-[var(--border)] p-5 flex flex-col gap-3" style={{ background: 'var(--bg)' }}>
              <div className="flex items-start gap-3">
                <span className="text-3xl">📦</span>
                <div>
                  <p className="font-bold text-lg">Vinn loot!</p>
                  <p className="text-[var(--muted)] text-sm mt-1">Etter hver 5. runde åpner du en kiste med kule premier og bonuser!</p>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="rules2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-4"
          >
            <p className="text-[var(--muted)] text-sm">Saml XP og klatr gjennom ligaene!</p>
            <div className="grid grid-cols-4 gap-2">
              {LEAGUES_DISPLAY.map(l => (
                <div key={l.name} className="flex flex-col items-center gap-1 rounded-lg p-2 border border-[var(--border)]" style={{ background: 'var(--bg)' }}>
                  <span className="text-2xl">{l.emoji}</span>
                  <span className="text-xs font-bold text-center" style={{ color: l.color }}>{l.name}</span>
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-[var(--border)] p-4" style={{ background: 'var(--bg)' }}>
              <div className="flex items-start gap-3">
                <span className="text-3xl">👑</span>
                <div>
                  <p className="font-bold">Crown Win!</p>
                  <p className="text-[var(--muted)] text-sm mt-1">10% sjanse for en kamp med krone. Svar riktig på ALT → få +50% XP!</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Slide dots */}
      <div className="flex justify-center gap-2">
        <button type="button" onClick={() => setRulesSlide(1)} className="w-2 h-2 rounded-full transition-colors" style={{ background: rulesSlide === 1 ? 'var(--accent)' : 'var(--border)' }} aria-label="Side 1" />
        <button type="button" onClick={() => setRulesSlide(2)} className="w-2 h-2 rounded-full transition-colors" style={{ background: rulesSlide === 2 ? 'var(--accent)' : 'var(--border)' }} aria-label="Side 2" />
      </div>

      {submitError && (
        <p className="bg-red-950/50 border border-[var(--danger)] text-[var(--danger)] rounded-lg px-4 py-2 text-sm">
          {submitError}
        </p>
      )}

      <div className="flex gap-3">
        {rulesSlide === 1 ? (
          <>
            <button type="button" onClick={() => goBack(2)} className="btn-secondary w-auto px-5">← Tilbake</button>
            <button type="button" onClick={() => setRulesSlide(2)} className="btn-primary">Neste →</button>
          </>
        ) : (
          <>
            <button type="button" onClick={() => setRulesSlide(1)} className="btn-secondary w-auto px-5">← Tilbake</button>
            <button type="button" onClick={handleComplete} disabled={submitting} className="btn-primary">
              {submitting ? 'Starter…' : 'Start spillet! 🚀'}
            </button>
          </>
        )}
      </div>
    </motion.div>
  )

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'radial-gradient(ellipse at top, #1a0a2e 0%, #0a0a0f 60%)' }}>
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-black tracking-tight text-white">
            Nors<span style={{ color: 'var(--accent)' }}>Nite</span>
          </h1>
          <p className="text-[var(--muted)] text-sm mt-1">Les. Vinn. Klatr.</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 justify-center mb-6">
          {([1, 2, 3] as const).map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors"
                style={{ background: step >= s ? 'var(--accent)' : 'var(--border)', color: step >= s ? 'white' : 'var(--muted)' }}>
                {s}
              </div>
              {s < 3 && <div className="w-8 h-0.5" style={{ background: step > s ? 'var(--accent)' : 'var(--border)' }} />}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-[var(--border)] p-6 overflow-hidden" style={{ background: 'var(--surface)' }}>
          <AnimatePresence mode="wait" custom={slideDir}>
            {step === 1 && step1}
            {step === 2 && step2}
            {step === 3 && step3}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
