import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from '@tanstack/react-router'
import { supabase } from '@/lib/supabase/client'
import { AuthCard } from '@/components/layout/AuthCard'

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
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async ({ email, password }: FormData) => {
    setError(null)
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) {
      setError(error.message === 'User already registered'
        ? 'Denne e-posten er allerede registrert. Prøv å logge inn.'
        : 'Noe gikk galt. Prøv igjen!')
    } else {
      // After signup, go to onboarding to pick username + avatar
      navigate({ to: '/velkommen' })
    }
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

        {error && (
          <p className="bg-red-950/50 border border-[var(--danger)] text-[var(--danger)] rounded-lg px-4 py-2 text-sm">
            {error}
          </p>
        )}

        <button type="submit" disabled={isSubmitting} className="btn-primary">
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
