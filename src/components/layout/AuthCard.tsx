import type { ReactNode } from 'react'
import norsniteLogo from '/images/norsnite-logo.png'

interface AuthCardProps {
  title: string
  children: ReactNode
}

export function AuthCard({ title, children }: AuthCardProps) {
  return (
    <div className="min-h-[100dvh] flex items-center justify-center p-4"
      style={{
        background: 'radial-gradient(ellipse at top, #1a0a2e 0%, #0a0a0f 60%)',
        paddingTop: 'max(env(safe-area-inset-top), 16px)',
        paddingBottom: 'max(env(safe-area-inset-bottom), 16px)',
      }}>
      <div className="w-full max-w-sm">
        {/* Logo / title. w-96 (384px) was wider than the 358px available inside
            p-4 on a 390px screen, so the logo overflowed horizontally. */}
        <div className="text-center mb-8">
          <img src={norsniteLogo} alt="NORSNITE" className="w-full max-w-[280px] mx-auto" />
          <p className="text-[var(--muted)] text-sm mt-1">Les. Vinn. Klatre.</p>
        </div>

        <div className="rounded-2xl border border-[var(--border)] p-6"
          style={{ background: 'var(--surface)' }}>
          <h2 className="text-xl font-bold mb-6 text-center">{title}</h2>
          {children}
        </div>
      </div>
    </div>
  )
}
