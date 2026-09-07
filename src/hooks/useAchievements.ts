// Hook: fetch earned achievements + check for new ones after round end

import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/client'
import { checkNewAchievements, type ProfileStats } from '@/lib/achievements'

type ProfileRow = Database['public']['Tables']['profiles']['Row']

export function useAchievements(userId: string | undefined) {
  const [earnedKeys, setEarnedKeys] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  // checkAndGrant is captured by GamePage's endRound callback, which does not
  // list it as a dependency. If the callback read earnedKeys from state it
  // would keep a closure over the empty initial Set and report every owned
  // achievement as new. Reading through a ref keeps checkAndGrant stable and
  // always current.
  const earnedRef = useRef<Set<string>>(new Set())
  // The in-flight initial fetch, so a round ending before it lands waits for
  // it instead of diffing against nothing.
  const loadRef = useRef<Promise<void> | null>(null)

  // Fetch earned achievements on mount
  useEffect(() => {
    if (!userId) return
    const load = async () => {
      const { data, error } = await supabase
        .from('earned_achievements')
        .select('achievement_key')
        .eq('user_id', userId)
      if (error) {
        console.error('Kunne ikke hente merker:', error)
      } else if (data) {
        const keys = new Set(data.map(r => r.achievement_key))
        earnedRef.current = keys
        setEarnedKeys(keys)
      }
      setLoading(false)
    }
    loadRef.current = load()
  }, [userId])

  // Check + grant new achievements after a round completes
  // Returns the list of newly earned achievement keys (for display)
  const checkAndGrant = useCallback(async (profile: ProfileRow): Promise<string[]> => {
    if (!userId) return []

    // Count total rounds and perfect rounds from xp_log
    const { count: totalRounds } = await supabase
      .from('xp_log')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    // Get recent rounds to count perfect rounds and consecutive perfect streak
    const { data: recentLogs } = await supabase
      .from('xp_log')
      .select('questions_correct, questions_total, crown_win')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(500)

    let perfects = 0
    let consecutivePerfect = 0
    let streakBroken = false

    if (recentLogs) {
      for (const log of recentLogs) {
        const isPerfect = log.questions_correct === log.questions_total && log.questions_total > 0
        if (isPerfect) perfects++
        if (!streakBroken && isPerfect) {
          consecutivePerfect++
        } else {
          streakBroken = true
        }
      }
    }

    // Count friends
    const { count: friendCount } = await supabase
      .from('friends')
      .select('*', { count: 'exact', head: true })
      .or(`requester_id.eq.${userId},receiver_id.eq.${userId}`)
      .eq('status', 'accepted')

    const stats: ProfileStats = {
      totalXp: profile.total_xp,
      totalCorrectAnswers: profile.total_correct_answers,
      streakDays: profile.streak_days,
      crownWins: profile.crown_wins,
      maxXpInDay: profile.max_xp_in_day,
      totalRounds: totalRounds ?? 0,
      perfectRounds: perfects,
      consecutivePerfect,
      friendCount: friendCount ?? 0,
    }

    const newKeys = checkNewAchievements(stats, earnedRef.current)

    if (newKeys.length > 0) {
      // upsert + ignoreDuplicates, not insert: a single already-owned key used
      // to make the whole batch fail on the (user_id, achievement_key) primary
      // key, so nothing was saved and every badge popped again next session.
      const { error } = await supabase.from('earned_achievements').upsert(
        newKeys.map(key => ({ user_id: userId, achievement_key: key })),
        { onConflict: 'user_id,achievement_key', ignoreDuplicates: true },
      )
      if (error) {
        // Never announce a badge we failed to record — it would pop again on
        // the next round. It stays pending and is granted next time.
        console.error('Kunne ikke lagre merker:', error)
        return []
      }

      const next = new Set(earnedRef.current)
      newKeys.forEach(k => next.add(k))
      earnedRef.current = next
      setEarnedKeys(next)
    }

    return newKeys
  }, [userId])

  return { earnedKeys, loading, checkAndGrant }
}
