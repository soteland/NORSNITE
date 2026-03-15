import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from '@tanstack/react-router'
import { supabase } from '@/lib/supabase/client'
import { AuthCard } from '@/components/layout/AuthCard'
import { TurnstileWidget } from '@/components/ui/TurnstileWidget'

const schema = z.object({
  email: z.string().email('Ugyldig e-postadresse'),
  password: z.string().min(6, 'Passord må være minst 6 tegn'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passordene er ikke like',
  path: ['confirmPassword'],
})
type FormData = z.infer<typeof schema>

export default function SignupPage() {
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [turnstileOk, setTurnstileOk] = useState(false)
  const turnstileTokenRef = useRef<string | null>(null)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async ({ email, password }: FormData) => {
    if (!turnstileOk) return
    setError(null)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { captchaToken: turnstileTokenRef.current ?? undefined },
    })
    if (error) {
      setError(error.message === 'User already registered'
        ? 'Denne e-posten er allerede registrert. Prøv å logge inn.'
        : 'Noe gikk galt. Prøv igjen!')
    } else {
      setSent(true)
    }
  }

  if (sent) {
    return (
      <AuthCard title="Sjekk e-posten din 📬">
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-5xl">✉️</p>
          <p className="text-white font-bold text-lg">Konto opprettet!</p>
          <p className="text-[var(--muted)] text-sm leading-relaxed">
                    Vi har sendt en e-post til deg. <br></br>
                    Åpne e-posten og trykk på lenken for å aktivere kontoen din.
                </p>
                <p>Spør gjerne en voksen om hjelp!</p>
          <p className="text-[var(--muted)] text-sm mt-2">
            Ikke fått e-post? Sjekk søppelpost-mappen.
          </p>
        </div>
        <Link to="/logg-inn" className="btn-primary block text-center mt-6">
          Gå til innlogging
        </Link>
      </AuthCard>
    )
  }

  return (
    <AuthCard title="Lag konto 🎮">
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
            autoComplete="new-password"
            placeholder="Minst 6 tegn"
            className="auth-input"
          />
          {errors.password && <p className="text-[var(--danger)] text-sm mt-1">{errors.password.message}</p>}
        </div>

        <div>
          <label className="block text-sm text-[var(--muted)] mb-1">Bekreft passord</label>
          <input
            {...register('confirmPassword')}
            type="password"
            autoComplete="new-password"
            placeholder="Skriv passord på nytt"
            className="auth-input"
          />
          {errors.confirmPassword && <p className="text-[var(--danger)] text-sm mt-1">{errors.confirmPassword.message}</p>}
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
          {isSubmitting ? 'Lager konto…' : 'Lag konto 🚀'}
        </button>
      </form>

      <p className="text-center text-sm text-[var(--muted)] mt-4">
        Har du konto?{' '}
        <Link to="/logg-inn" className="text-[var(--accent)] hover:underline">
          Logg inn her
        </Link>
      </p>
    </AuthCard>
  )
}
