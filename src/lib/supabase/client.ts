import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY — copy .env.example to .env.local and fill in values.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    // Sessions last forever — refresh token never expires (set in Supabase dashboard)
    storageKey: 'norsnite-session',
  },
})

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          last_rename_at: string | null
          avatar_config: Record<string, unknown>
          total_xp: number
          total_correct_answers: number
          today_xp: number
          today_date: string
          max_xp_in_day: number
          streak_days: number
          last_active_date: string | null
          difficulty_level: number
          crown_wins: number
          streak_shield_days: number    // total days of streak protection banked (max 7)
          skip_tokens: number
          rounds_since_loot: number
          is_banned: boolean
          created_at: string
        }
        Insert: Partial<Database['public']['Tables']['profiles']['Row']> & { id: string; username: string }
        Update: Partial<Database['public']['Tables']['profiles']['Row']>
      }
      xp_log: {
        Row: {
          id: number
          user_id: string
          xp_earned: number
          questions_total: number
          questions_correct: number
          crown_round: boolean
          crown_win: boolean
          used_skip: boolean
          difficulty_level: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['xp_log']['Row'], 'id' | 'created_at'>
        Update: never
      }
      friends: {
        Row: {
          id: number
          requester_id: string
          receiver_id: string
          status: 'pending' | 'accepted' | 'blocked'
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['friends']['Row'], 'id' | 'created_at'>
        Update: Pick<Database['public']['Tables']['friends']['Row'], 'status'>
      }
    }
  }
}

// claim_loot() RPC response
export type LootResult =
  | { type: 'xp';     rarity: 'common';     xp: number; shield_days: 0; skip_tokens: 0 }
  | { type: 'skip';   rarity: 'uncommon';   xp: 0; shield_days: 0; skip_tokens: 1 }
  | { type: 'shield'; rarity: 'uncommon';   xp: 0; shield_days: 1; skip_tokens: 0 }
  | { type: 'shield'; rarity: 'rare';       xp: 0; shield_days: 2; skip_tokens: 0 }
  | { type: 'shield'; rarity: 'epic';       xp: 0; shield_days: 3; skip_tokens: 0 }
  | { type: 'shield'; rarity: 'legendary';  xp: 0; shield_days: 5; skip_tokens: 0 }
