import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from '@tanstack/react-router'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/lib/auth/AuthContext'
import { getLeague } from '@/lib/xp'
import GameMenu from '@/components/layout/GameMenu'

const LEAGUE_EMOJI: Record<string, string> = {
  Bronze: '🥉', Silver: '🥈', Gold: '🥇',
  Platinum: '💜', Diamond: '💙', Elite: '🔥',
  Champion: '👑', Unreal: '⚡',
}

type Profile = {
  id: string
  username: string
  total_xp: number
}

type FriendEntry = {
  friendshipId: number
  profile: Profile
  isRequester: boolean
  status: 'pending' | 'accepted'
}

export default function FriendsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [friends, setFriends] = useState<FriendEntry[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResult, setSearchResult] = useState<Profile | null | 'not_found' | 'self' | 'already'>(null)
  const [searching, setSearhing] = useState(false)
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const [confirmRemoveId, setConfirmRemoveId] = useState<number | null>(null)

  useEffect(() => {
    if (user) loadFriends()
  }, [user])

  async function loadFriends() {
    if (!user) return
    setLoading(true)
    const { data: rows } = await supabase
      .from('friends')
      .select('*')
      .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .neq('status', 'blocked')
      .order('created_at', { ascending: false })

    if (!rows) { setLoading(false); return }

    const friendIds = rows.map(r =>
      r.requester_id === user.id ? r.receiver_id : r.requester_id
    )

    if (friendIds.length === 0) { setFriends([]); setLoading(false); return }

    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, username, total_xp')
      .in('id', friendIds)

    const profileMap = new Map((profiles ?? []).map(p => [p.id, p]))

    setFriends(rows.map(r => ({
      friendshipId: r.id,
      profile: profileMap.get(r.requester_id === user.id ? r.receiver_id : r.requester_id)!,
      isRequester: r.requester_id === user.id,
      status: r.status as 'pending' | 'accepted',
    })).filter(f => f.profile))

    setLoading(false)
  }

  async function handleSearch() {
    if (!searchQuery.trim() || !user) return
    setSearhing(true)
    setSearchResult(null)

    const { data } = await supabase
      .from('profiles')
      .select('id, username, total_xp')
      .eq('username', searchQuery.trim())
      .maybeSingle()

    if (!data) { setSearchResult('not_found'); setSearhing(false); return }
    if (data.id === user.id) { setSearchResult('self'); setSearhing(false); return }

    const already = friends.some(f => f.profile.id === data.id)
    if (already) { setSearchResult('already'); setSearhing(false); return }

    setSearchResult(data)
    setSearhing(false)
  }

  async function sendRequest() {
    if (!user || !searchResult || typeof searchResult !== 'object') return
    setSending(true)
    await supabase.from('friends').insert({
      requester_id: user.id,
      receiver_id: searchResult.id,
      status: 'pending',
    })
    setSending(false)
    setSearchQuery('')
    setSearchResult(null)
    loadFriends()
  }

  async function acceptRequest(friendshipId: number) {
    setActionLoading(friendshipId)
    await supabase.from('friends').update({ status: 'accepted' }).eq('id', friendshipId)
    setActionLoading(null)
    loadFriends()
  }

  async function declineRequest(friendshipId: number) {
    setActionLoading(friendshipId)
    await supabase.from('friends').delete().eq('id', friendshipId)
    setActionLoading(null)
    loadFriends()
  }

  const pending  = friends.filter(f => f.status === 'pending' && !f.isRequester)
  const sent     = friends.filter(f => f.status === 'pending' && f.isRequester)
  const accepted = friends.filter(f => f.status === 'accepted')

  return (
    <div className="min-h-[100dvh] flex flex-col"
         style={{ paddingTop: 'max(env(safe-area-inset-top), 16px)', paddingBottom: 'max(env(safe-area-inset-bottom), 16px)' }}>

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3">
        <button
          onClick={() => navigate({ to: '/spill' })}
          className="flex items-center gap-1 text-[var(--muted)] text-sm font-semibold hover:text-white transition px-2 py-1"
        >
          ← Spill
        </button>
        <h1 className="text-2xl font-black text-white">Venner</h1>
        <GameMenu />
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-4 space-y-6">

        {/* Search */}
        <section>
          <p className="text-xs uppercase tracking-widest text-[var(--muted)] mb-2">Legg til venn</p>
          <div className="flex gap-2">
            <input
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setSearchResult(null) }}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="Brukernavn…"
              className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3
                         text-white placeholder:text-[var(--muted)] focus:outline-none focus:border-purple-400
                         text-base"
            />
            <button
              onClick={handleSearch}
              disabled={!searchQuery.trim() || searching}
              className="px-4 py-3 rounded-xl bg-purple-600 text-white font-bold
                         hover:bg-purple-500 active:scale-[0.97] transition-all
                         disabled:opacity-40"
            >
              {searching ? '…' : '🔍'}
            </button>
          </div>

          {/* Search result */}
          {searchResult === 'not_found' && (
            <p className="mt-2 text-sm text-[var(--muted)]">Ingen bruker funnet med det brukernavnet.</p>
          )}
          {searchResult === 'self' && (
            <p className="mt-2 text-sm text-[var(--muted)]">Det er deg selv! 😄</p>
          )}
          {searchResult === 'already' && (
            <p className="mt-2 text-sm text-[var(--muted)]">Dere er allerede venner (eller forespørselen er sendt).</p>
          )}
          {searchResult && typeof searchResult === 'object' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 flex items-center justify-between bg-white/10 border border-white/20
                         rounded-2xl px-4 py-3"
            >
              <div>
                <p className="text-white font-bold">{searchResult.username}</p>
                <p className="text-[var(--muted)] text-sm">
                  {LEAGUE_EMOJI[getLeague(searchResult.total_xp)]} {getLeague(searchResult.total_xp)}
                </p>
              </div>
              <button
                onClick={sendRequest}
                disabled={sending}
                className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-sm
                           hover:bg-purple-500 active:scale-[0.97] transition-all disabled:opacity-40"
              >
                {sending ? '…' : 'Send forespørsel'}
              </button>
            </motion.div>
          )}
        </section>

        {/* Pending incoming requests */}
        {pending.length > 0 && (
          <section>
            <p className="text-xs uppercase tracking-widest text-[var(--muted)] mb-2">
              Ventende forespørsler ({pending.length})
            </p>
            <div className="space-y-2">
              {pending.map(f => (
                <motion.div
                  key={f.friendshipId}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between bg-purple-600/20 border border-purple-400/30
                             rounded-2xl px-4 py-3"
                >
                  <div>
                    <p className="text-white font-bold">{f.profile.username}</p>
                    <p className="text-[var(--muted)] text-sm">
                      {LEAGUE_EMOJI[getLeague(f.profile.total_xp)]} {getLeague(f.profile.total_xp)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => acceptRequest(f.friendshipId)}
                      disabled={actionLoading === f.friendshipId}
                      className="px-3 py-2 rounded-xl bg-green-600 text-white font-bold text-sm
                                 hover:bg-green-500 active:scale-[0.97] transition-all disabled:opacity-40"
                    >✓</button>
                    <button
                      onClick={() => declineRequest(f.friendshipId)}
                      disabled={actionLoading === f.friendshipId}
                      className="px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white font-bold text-sm
                                 hover:bg-white/20 active:scale-[0.97] transition-all disabled:opacity-40"
                    >✕</button>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Friends list */}
        <section>
          <p className="text-xs uppercase tracking-widest text-[var(--muted)] mb-2">
            {accepted.length > 0 ? `Venner (${accepted.length})` : 'Ingen venner i listen enda'}
          </p>
          {loading ? (
            <p className="text-[var(--muted)] animate-pulse text-sm">Laster…</p>
          ) : (
            <div className="space-y-2">
              {accepted
                .sort((a, b) => b.profile.total_xp - a.profile.total_xp)
                .map((f, i) => (
                  <motion.div
                    key={f.friendshipId}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden"
                  >
                    {/* Main row */}
                    <div className="flex items-center justify-between px-4 py-3">
                      <button
                        onClick={() => navigate({ to: '/venner/$userId', params: { userId: f.profile.id } })}
                        className="flex items-center gap-3 flex-1 text-left"
                      >
                        <span className="text-2xl">{LEAGUE_EMOJI[getLeague(f.profile.total_xp)]}</span>
                        <div>
                          <p className="text-white font-bold">{f.profile.username}</p>
                          <p className="text-[var(--muted)] text-sm">{f.profile.total_xp} XP · {getLeague(f.profile.total_xp)}</p>
                        </div>
                      </button>
                      <button
                        onClick={() => setConfirmRemoveId(confirmRemoveId === f.friendshipId ? null : f.friendshipId)}
                        className="text-[var(--muted)] hover:text-red-400 transition-colors text-xs px-2 py-1"
                        title="Fjern venn"
                      >✕</button>
                    </div>

                    {/* Confirm remove */}
                    {confirmRemoveId === f.friendshipId && (
                      <div className="flex items-center justify-between px-4 py-2 bg-red-900/20 border-t border-red-500/20">
                        <p className="text-red-300 text-sm font-bold">Fjerne {f.profile.username}?</p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setConfirmRemoveId(null)}
                            className="px-3 py-1.5 rounded-xl bg-white/10 text-white text-xs font-bold hover:bg-white/20 transition"
                          >Avbryt</button>
                          <button
                            onClick={() => { setConfirmRemoveId(null); declineRequest(f.friendshipId) }}
                            disabled={actionLoading === f.friendshipId}
                            className="px-3 py-1.5 rounded-xl bg-red-700 text-white text-xs font-bold hover:bg-red-600 transition disabled:opacity-40"
                          >Ja, fjern</button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
            </div>
          )}
        </section>

        {/* Sent pending */}
        {sent.length > 0 && (
          <section>
            <p className="text-xs uppercase tracking-widest text-[var(--muted)] mb-2">
              Sendte forespørsler ({sent.length})
            </p>
            <div className="space-y-2">
              {sent.map(f => (
                <div
                  key={f.friendshipId}
                  className="flex items-center justify-between bg-white/5 border border-white/10
                             rounded-2xl px-4 py-3"
                >
                  <div>
                    <p className="text-white font-bold">{f.profile.username}</p>
                    <p className="text-[var(--muted)] text-sm">Venter på svar…</p>
                  </div>
                  <button
                    onClick={() => declineRequest(f.friendshipId)}
                    disabled={actionLoading === f.friendshipId}
                    className="text-[var(--muted)] hover:text-red-400 transition-colors text-xs px-2 py-1"
                    title="Trekk tilbake"
                  >Trekk tilbake</button>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
