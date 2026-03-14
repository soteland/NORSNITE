// Hook: fetch earned achievements + check for new ones after round end

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/client'
import { checkNewAchievements, type ProfileStats } from '@/lib/achievements'

type ProfileRow = Database['public']['Tables']['profiles']['Row']

export function useAchievements(userId: string | undefined) {
  const [earnedKeys, setEarnedKeys] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  // Fetch earned achievements on mount
  useEffect(() => {
    if (!userId) return
    supabase
      .from('earned_achievements')
      .select('achievement_key')
      .eq('user_id', userId)
      .then(({ data }) => {
        if (data) {
          setEarnedKeys(new Set(data.map(r => r.achievement_key)))
        }
        setLoading(false)
      })
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

    const { count: perfectRounds } = await supabase
      .from('xp_log')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('crown_win', false) // we need "perfect" = questions_correct == questions_total
    // Actually, perfect means correct == total. Let's fetch the last few to count consecutive.

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

    const newKeys = checkNewAchievements(stats, earnedKeys)

    if (newKeys.length > 0) {
      // Insert new achievements into DB
      const rows = newKeys.map(key => ({
        user_id: userId,
        achievement_key: key,
      }))
      await supabase.from('earned_achievements').insert(rows)

      // Update local state
      setEarnedKeys(prev => {
        const next = new Set(prev)
        newKeys.forEach(k => next.add(k))
        return next
      })
    }

    return newKeys
  }, [userId, earnedKeys])

  return { earnedKeys, loading, checkAndGrant }
}
