import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/lib/auth/AuthContext'
import { useNavigate } from '@tanstack/react-router'
import { supabase } from '@/lib/supabase/client'
import { getLeague } from '@/lib/xp'
import GameMenu from '@/components/layout/GameMenu'
import type { Database } from '@/lib/supabase/client'

type ProfileRow = Database['public']['Tables']['profiles']['Row']

const ADMIN_USER_ID = import.meta.env.VITE_ADMIN_USER_ID as string

const LEAGUE_EMOJI: Record<string, string> = {
  Bronze: '🥉', Silver: '🥈', Gold: '🥇',
  Platinum: '💎', Diamond: '💠', Elite: '⭐',
  Champion: '🏆', Unreal: '👑',
}

const PAGE_SIZE = 25

type SortField = 'total_xp' | 'username' | 'last_active_date' | 'streak_days'

function formatDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('nb-NO', { day: '2-digit', month: '2-digit', year: '2-digit' })
}

export default function AdminPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [profiles, setProfiles] = useState<ProfileRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [sortField, setSortField] = useState<SortField>('total_xp')
  const [sortAsc, setSortAsc] = useState(false)
  const [page, setPage] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [banningId, setBanningId] = useState<string | null>(null)

  // Season end date — stored locally (no season table in DB yet)
  const [seasonEnd, setSeasonEnd] = useState<string>(
    () => localStorage.getItem('admin_season_end') ?? ''
  )
  const [seasonSaved, setSeasonSaved] = useState(false)

  useEffect(() => {
    if (user && user.id !== ADMIN_USER_ID) navigate({ to: '/' })
  }, [user, navigate])

  const fetchProfiles = useCallback(async () => {
    setLoading(true)
    setError(null)
    const from = page * PAGE_SIZE
    const to = from + PAGE_SIZE - 1

    let query = supabase
      .from('profiles')
      .select('*', { count: 'exact' })
      .order(sortField, { ascending: sortAsc })
      .range(from, to)

    if (search.trim()) {
      query = query.ilike('username', `%${search.trim()}%`)
    }

    const { data, error: err, count } = await query
    if (err) {
      setError(err.message)
    } else {
      setProfiles(data ?? [])
      setTotalCount(count ?? 0)
    }
    setLoading(false)
  }, [page, sortField, sortAsc, search])

  useEffect(() => { fetchProfiles() }, [fetchProfiles])

  // Debounce search resets page
  useEffect(() => { setPage(0) }, [search])

  async function toggleBan(profile: ProfileRow) {
    setBanningId(profile.id)
    const { error: err } = await supabase
      .from('profiles')
      .update({ is_banned: !profile.is_banned })
      .eq('id', profile.id)
    if (!err) {
      setProfiles(prev =>
        prev.map(p => p.id === profile.id ? { ...p, is_banned: !p.is_banned } : p)
      )
    }
    setBanningId(null)
  }

  function handleSort(field: SortField) {
    if (field === sortField) setSortAsc(a => !a)
    else { setSortField(field); setSortAsc(false) }
    setPage(0)
  }

  function saveSeasonEnd() {
    localStorage.setItem('admin_season_end', seasonEnd)
    setSeasonSaved(true)
    setTimeout(() => setSeasonSaved(false), 2000)
  }

  const totalPages = Math.ceil(totalCount / PAGE_SIZE)

  if (!user || user.id !== ADMIN_USER_ID) return null

  const SortHeader = ({ field, label }: { field: SortField; label: string }) => (
    <th
      className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wider cursor-pointer select-none
                 hover:text-white transition-colors whitespace-nowrap"
      onClick={() => handleSort(field)}
    >
      {label}
      {sortField === field && (
        <span className="ml-1 opacity-60">{sortAsc ? '↑' : '↓'}</span>
      )}
    </th>
  )

  return (
    <div
      className="min-h-[100dvh] flex flex-col p-4 gap-5"
      style={{ paddingTop: 'max(env(safe-area-inset-top), 16px)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-white">🛡️ Admin</h1>
        <GameMenu />
      </div>

      {/* Season panel */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
        <h2 className="font-bold text-white text-sm uppercase tracking-wider">🗓️ Sesong slutt-dato</h2>
        <div className="flex gap-2 items-center">
          <input
            type="date"
            value={seasonEnd}
            onChange={e => setSeasonEnd(e.target.value)}
            className="flex-1 rounded-xl bg-white/10 border border-white/20 text-white px-3 py-2 text-sm
                       focus:outline-none focus:border-purple-400"
          />
          <button
            onClick={saveSeasonEnd}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm transition"
          >
            {seasonSaved ? '✓ Lagret' : 'Lagre'}
          </button>
        </div>
        {seasonEnd && (
          <p className="text-[var(--muted)] text-xs">
            Sesongen slutter: <span className="text-white">{formatDate(seasonEnd)}</span>
            {' '}({Math.max(0, Math.ceil((new Date(seasonEnd).getTime() - Date.now()) / 86_400_000))} dager igjen)
          </p>
        )}
        <p className="text-yellow-400/70 text-xs">
          ⚠️ Season reset-funksjon krever en Supabase RPC (ikke implementert ennå).
        </p>
      </div>

      {/* User list */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/10 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <h2 className="font-bold text-white text-sm uppercase tracking-wider">
            👥 Brukere
            {!loading && <span className="ml-2 text-[var(--muted)] font-normal normal-case">{totalCount} totalt</span>}
          </h2>
          <input
            type="search"
            placeholder="Søk brukernavn…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full sm:w-56 rounded-xl bg-white/10 border border-white/20 text-white px-3 py-1.5 text-sm
                       placeholder:text-white/30 focus:outline-none focus:border-purple-400"
          />
        </div>

        {error && (
          <div className="p-4 text-red-400 text-sm">{error}</div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-[var(--muted)]">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <SortHeader field="username" label="Brukernavn" />
                <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wider whitespace-nowrap">Liga</th>
                <SortHeader field="total_xp" label="XP" />
                <SortHeader field="streak_days" label="🔥 Streak" />
                <SortHeader field="last_active_date" label="Sist aktiv" />
                <th className="px-3 py-2 text-center text-xs font-bold uppercase tracking-wider">Utestengt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center animate-pulse">Laster…</td>
                </tr>
              ) : profiles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center">Ingen brukere funnet</td>
                </tr>
              ) : profiles.map(p => {
                const league = getLeague(p.total_xp)
                return (
                  <tr key={p.id} className={`hover:bg-white/5 transition ${p.is_banned ? 'opacity-50' : ''}`}>
                    <td className="px-3 py-2.5 font-bold text-white">{p.username}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      {LEAGUE_EMOJI[league]} {league}
                    </td>
                    <td className="px-3 py-2.5 tabular-nums">{p.total_xp.toLocaleString('nb-NO')}</td>
                    <td className="px-3 py-2.5 tabular-nums">{p.streak_days}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap">{formatDate(p.last_active_date)}</td>
                    <td className="px-3 py-2.5 text-center">
                      <button
                        onClick={() => toggleBan(p)}
                        disabled={banningId === p.id}
                        title={p.is_banned ? 'Fjern utestengning' : 'Utesteng bruker'}
                        className={`w-10 h-6 rounded-full transition-all relative
                          ${p.is_banned
                            ? 'bg-red-500 hover:bg-red-400'
                            : 'bg-white/20 hover:bg-white/30'}
                          disabled:opacity-40`}
                      >
                        <span
                          className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all
                            ${p.is_banned ? 'left-5' : 'left-1'}`}
                        />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-white/10 flex items-center justify-between gap-3">
            <button
              disabled={page === 0}
              onClick={() => setPage(p => p - 1)}
              className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-bold
                         disabled:opacity-30 transition"
            >← Forrige</button>
            <span className="text-[var(--muted)] text-sm">
              Side {page + 1} av {totalPages}
            </span>
            <button
              disabled={page >= totalPages - 1}
              onClick={() => setPage(p => p + 1)}
              className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-bold
                         disabled:opacity-30 transition"
            >Neste →</button>
          </div>
        )}
      </div>
    </div>
  )
}
