import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from '@tanstack/react-router'
import { supabase } from '@/lib/supabase/client'
import { AuthCard } from '@/components/layout/AuthCard'
import { TurnstileWidget } from '@/components/ui/TurnstileWidget'

const schema = z.object({
  email: z.string().email('Ugyldig e-postadresse'),
  password: z.string().min(6, 'Passord må være minst 6 tegn'),
})
type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [turnstileOk, setTurnstileOk] = useState(false)
  const turnstileTokenRef = useRef<string | null>(null)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    if (!turnstileOk) return
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({
      ...data,
      options: { captchaToken: turnstileTokenRef.current ?? undefined },
    })
    if (error) {
      setError('Feil e-post eller passord. Prøv igjen!')
    } else {
      navigate({ to: '/' })
    }
  }

  return (
    <AuthCard title="Logg inn på NorsNite 🎮">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div>
          <label className="block text-sm text-[var(--muted)] mb-1">E-post</label>
          <input
            {...register('email')}
            type="email"
            autoComplete="email"
            placeholder="deg@eksempel.no"
            className="auth-input"
          />
          {errors.email && <p className="text-[var(--danger)] text-sm mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm text-[var(--muted)] mb-1">Passord</label>
          <input
            {...register('password')}
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            className="auth-input"
          />
          {errors.password && <p className="text-[var(--danger)] text-sm mt-1">{errors.password.message}</p>}
        </div>

        <TurnstileWidget
          onSuccess={(token) => { turnstileTokenRef.current = token; setTurnstileOk(true) }}
          onExpire={() => { turnstileTokenRef.current = null; setTurnstileOk(false) }}
        />

        {error && (
          <p className="bg-red-950/50 border border-[var(--danger)] text-[var(--danger)] rounded-lg px-4 py-2 text-sm">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting || !turnstileOk}
          className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Logger inn…' : 'Logg inn 🚀'}
        </button>
      </form>

      <div className="flex flex-col gap-2 text-center text-sm mt-4">
        <Link to="/glemt-passord" className="text-[var(--accent)] hover:underline">
          Glemt passord?
        </Link>
        <span className="text-[var(--muted)]">
          Ny bruker?{' '}
          <Link to="/registrer" className="text-[var(--accent)] hover:underline">
            Lag konto her
          </Link>
        </span>
        <Link to="/personvern" className="text-[var(--muted)] text-xs hover:underline mt-2">
          Personvern
        </Link>
      </div>
    </AuthCard>
  )
}
