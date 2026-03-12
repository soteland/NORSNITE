import { useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/lib/auth/AuthContext'

export default function HomePage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) return
    supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) navigate({ to: '/velkommen' })
        else navigate({ to: '/spill' })
      })
  }, [user, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-[var(--muted)] animate-pulse">Laster…</p>
    </div>
  )
}
