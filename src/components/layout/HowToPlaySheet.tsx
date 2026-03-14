import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const LEAGUES_DISPLAY = [
  { name: 'Bronse',    emoji: '🥉', color: '#cd7f32' },
  { name: 'Sølv',     emoji: '🥈', color: '#aaaaaa' },
  { name: 'Gull',     emoji: '🥇', color: '#f59e0b' },
  { name: 'Platina',  emoji: '💜', color: '#a855f7' },
  { name: 'Diamant',  emoji: '💙', color: '#3b82f6' },
  { name: 'Elite',    emoji: '🔥', color: '#ef4444' },
  { name: 'Champion', emoji: '👑', color: '#f59e0b' },
  { name: 'Unreal',   emoji: '⚡', color: '#06b6d4' },
]

// ── Shared content (used both in sheet and onboarding step 3) ─────────────────

interface ContentProps {
  onDone: () => void
  doneLabel?: string
  disabled?: boolean
}

export function HowToPlayContent({ onDone, doneLabel = 'Forstått! 🚀', disabled = false }: ContentProps) {
  const [slide, setSlide] = useState<1 | 2>(1)

  return (
    <div className="flex flex-col gap-4">
      {/* Slide dots */}
      <div className="flex justify-center gap-2">
        <button type="button" onClick={() => setSlide(1)}
          className="w-2 h-2 rounded-full transition-colors"
          style={{ background: slide === 1 ? 'var(--accent)' : 'var(--border)' }}
          aria-label="Side 1" />
        <button type="button" onClick={() => setSlide(2)}
          className="w-2 h-2 rounded-full transition-colors"
          style={{ background: slide === 2 ? 'var(--accent)' : 'var(--border)' }}
          aria-label="Side 2" />
      </div>

      <AnimatePresence mode="wait">
        {slide === 1 ? (
          <motion.div
            key="s1"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}
            className="flex flex-col gap-3"
          >
            {[
              { icon: '⭐', title: 'Tjen XP!', body: 'Svar riktig på spørsmål for å tjene XP. Perfekt runde? +25% bonus! Krone-vinn? +50% bonus!' },
              { icon: '🔥', title: 'Hold streak-en!', body: 'Spill hver dag for å bygge opp streak-en din. Jo lenger streak, jo kulere er du!' },
              { icon: '📦', title: 'Vinn loot!', body: 'Etter 5 runder får du en kiste med kule premier og bonuser!' },
            ].map(({ icon, title, body }) => (
              <div key={title} className="rounded-xl border border-[var(--border)] p-4 flex items-start gap-3" style={{ background: 'var(--bg)' }}>
                <span className="text-3xl">{icon}</span>
                <div>
                  <p className="font-bold">{title}</p>
                  <p className="text-[var(--muted)] text-sm mt-0.5">{body}</p>
                </div>
              </div>
            ))}
            <button type="button" onClick={() => setSlide(2)} className="btn-primary mt-1">Neste →</button>
          </motion.div>
        ) : (
          <motion.div
            key="s2"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}
            className="flex flex-col gap-3"
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
            <div className="rounded-xl border border-[var(--border)] p-4 flex items-start gap-3" style={{ background: 'var(--bg)' }}>
              <span className="text-3xl">👑</span>
              <div>
                <p className="font-bold">Crown Win!</p>
                <p className="text-[var(--muted)] text-sm mt-0.5">10% sjanse for en kamp med krone. Svar riktig på ALT → +50% XP!</p>
              </div>
            </div>
            <div className="flex gap-2 mt-1">
              <button type="button" onClick={() => setSlide(1)} className="btn-secondary w-auto px-5">← Tilbake</button>
              <button type="button" onClick={onDone} disabled={disabled} className="btn-primary">
                {disabled ? 'Starter…' : doneLabel}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Bottom sheet wrapper (used from GameMenu) ─────────────────────────────────

interface SheetProps {
  open: boolean
  onClose: () => void
}

export default function HowToPlaySheet({ open, onClose }: SheetProps) {
  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/60 transition-opacity duration-300
                    ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Bottom sheet */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50
                    bg-[var(--surface)] border-t border-[var(--border)] rounded-t-3xl
                    transition-transform duration-300 ease-out overflow-y-auto max-h-[90dvh]
                    ${open ? 'translate-y-0' : 'translate-y-full'}`}
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 24px)' }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        <div className="px-5 pt-2 pb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-black text-white">Slik spiller du 🏆</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[var(--muted)] hover:text-white transition"
              aria-label="Lukk"
            >✕</button>
          </div>
          <HowToPlayContent onDone={onClose} doneLabel="Forstått! 🚀" />
        </div>
      </div>
    </>
  )
}
