import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useAuth } from '@/lib/auth/AuthContext'
import { useMute } from '@/lib/useMute'

interface Props {
  /** Extra classes for the trigger button */
  className?: string
}

export default function GameMenu({ className = '' }: Props) {
  const [open, setOpen] = useState(false)
  const { speechMuted, sfxMuted, toggleSpeech, toggleSfx } = useMute()
  const { signOut } = useAuth()
  const navigate = useNavigate()

  function close() { setOpen(false) }

  async function handleSignOut() {
    close()
    await signOut()
    navigate({ to: '/logg-inn' })
  }

  function go(to: string) {
    close()
    navigate({ to })
  }

  return (
    <>
      {/* Trigger — hamburger icon */}
      <button
        onClick={() => setOpen(true)}
        className={`flex flex-col justify-center items-center gap-[5px] w-10 h-10 rounded-xl
                    hover:bg-white/10 transition ${className}`}
        aria-label="Meny"
      >
        <span className="block w-5 h-0.5 bg-[var(--muted)] rounded-full" />
        <span className="block w-5 h-0.5 bg-[var(--muted)] rounded-full" />
        <span className="block w-5 h-0.5 bg-[var(--muted)] rounded-full" />
      </button>

      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/60 transition-opacity duration-300
                    ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={close}
      />

      {/* Bottom sheet */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50
                    bg-[var(--surface)] border-t border-[var(--border)] rounded-t-3xl
                    transition-transform duration-300 ease-out
                    ${open ? 'translate-y-0' : 'translate-y-full'}`}
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 24px)' }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        <div className="px-5 pb-2 space-y-1">

          {/* Speech toggle */}
          <button
            onClick={toggleSpeech}
            className="w-full flex items-center justify-between px-4 py-4 rounded-2xl
                       bg-white/5 hover:bg-white/10 transition text-left"
          >
            <span className="flex items-center gap-3 text-white font-semibold text-base">
              <span className="text-xl">{speechMuted ? '🔇' : '🗣️'}</span>
              Tale
            </span>
            <span className={`w-11 h-6 rounded-full transition-colors relative
                              ${speechMuted ? 'bg-white/20' : 'bg-purple-600'}`}>
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform
                                ${speechMuted ? 'translate-x-0.5' : 'translate-x-5'}`} />
            </span>
          </button>

          {/* SFX toggle */}
          <button
            onClick={toggleSfx}
            className="w-full flex items-center justify-between px-4 py-4 rounded-2xl
                       bg-white/5 hover:bg-white/10 transition text-left"
          >
            <span className="flex items-center gap-3 text-white font-semibold text-base">
              <span className="text-xl">{sfxMuted ? '🔕' : '🔊'}</span>
              Lydeffekter
            </span>
            <span className={`w-11 h-6 rounded-full transition-colors relative
                              ${sfxMuted ? 'bg-white/20' : 'bg-purple-600'}`}>
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform
                                ${sfxMuted ? 'translate-x-0.5' : 'translate-x-5'}`} />
            </span>
          </button>

          {/* Divider */}
          <div className="h-px bg-[var(--border)] my-2" />

          {/* Nav items */}
          {[
            { emoji: '🏆', label: 'Ligaer', to: '/ligaer' },
            { emoji: '👤', label: 'Profil', to: '/profil' },
            { emoji: '👥', label: 'Venner', to: '/venner' },
          ].map(({ emoji, label, to }) => (
            <button
              key={to}
              onClick={() => go(to)}
              className="w-full flex items-center gap-3 px-4 py-4 rounded-2xl
                         hover:bg-white/10 transition text-left text-white font-semibold text-base"
            >
              <span className="text-xl">{emoji}</span>
              {label}
            </button>
          ))}

          {/* Divider */}
          <div className="h-px bg-[var(--border)] my-2" />

          {/* Sign out */}
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-4 rounded-2xl
                       hover:bg-red-500/10 transition text-left text-red-400 font-semibold text-base"
          >
            <span className="text-xl">🚪</span>
            Logg ut
          </button>
        </div>
      </div>
    </>
  )
}
