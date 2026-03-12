import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from '@tanstack/react-router'
import { supabase } from '@/lib/supabase/client'
import { AuthCard } from '@/components/layout/AuthCard'

const schema = z.object({
  password: z.string().min(6, 'Passord må være minst 6 tegn'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passordene er ikke like',
  path: ['confirmPassword'],
})
type FormData = z.infer<typeof schema>

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // Supabase sets session from the URL hash automatically on this page
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true)
      else navigate({ to: '/glemt-passord' })
    })
  }, [navigate])

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async ({ password }: FormData) => {
    setError(null)
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setError('Noe gikk galt. Prøv å be om en ny lenke.')
    } else {
      navigate({ to: '/' })
    }
  }

  if (!ready) return null

  return (
    <AuthCard title="Lag nytt passord 🔐">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div>
          <label className="block text-sm text-[var(--muted)] mb-1">Nytt passord</label>
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
          {isSubmitting ? 'Lagrer…' : 'Lagre nytt passord ✅'}
        </button>
      </form>
    </AuthCard>
  )
}
