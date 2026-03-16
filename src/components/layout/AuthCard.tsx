import type { ReactNode } from 'react'
import norsniteLogo from '/images/norsnite-logo.png'

interface AuthCardProps {
  title: string
  children: ReactNode
}

export function AuthCard({ title, children }: AuthCardProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'radial-gradient(ellipse at top, #1a0a2e 0%, #0a0a0f 60%)' }}>
      <div className="w-full max-w-sm">
        {/* Logo / title */}
        <div className="text-center mb-8">
                  <h1 className="text-4xl font-black tracking-tight text-white">
                      
                      <img src={norsniteLogo} alt="NORSNITE" className="w-96 mx-auto" />
            
          </h1>
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
