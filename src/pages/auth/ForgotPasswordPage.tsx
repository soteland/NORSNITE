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
})
type FormData = z.infer<typeof schema>

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [turnstileOk, setTurnstileOk] = useState(false)
  const turnstileTokenRef = useRef<string | null>(null)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async ({ email }: FormData) => {
    if (!turnstileOk) return
    setError(null)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/nytt-passord`,
    })
    if (error) {
      setError('Noe gikk galt. Prøv igjen!')
    } else {
      setSent(true)
    }
  }

  if (sent) {
    return (
      <AuthCard title="Sjekk e-posten din 📬">
        <p className="text-center text-[var(--muted)]">
          Vi har sendt en lenke til e-posten din. Klikk på lenken for å lage nytt passord.
        </p>
        <Link to="/logg-inn" className="btn-primary block text-center mt-4">
          Tilbake til innlogging
        </Link>
      </AuthCard>
    )
  }

  return (
    <AuthCard title="Glemt passord? 🔑">
      <p className="text-[var(--muted)] text-sm mb-4">
        Skriv inn e-posten din, så sender vi deg en lenke for å lage nytt passord.
      </p>

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

        <TurnstileWidget
          onSuccess={(token) => {
            turnstileTokenRef.current = token
            setTurnstileOk(true)
          }}
          onExpire={() => setTurnstileOk(false)}
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
          {isSubmitting ? 'Sender…' : 'Send tilbakestillingslenke'}
        </button>
      </form>

      <Link to="/logg-inn" className="block text-center text-sm text-[var(--accent)] hover:underline mt-4">
        ← Tilbake til innlogging
      </Link>
    </AuthCard>
  )
}
