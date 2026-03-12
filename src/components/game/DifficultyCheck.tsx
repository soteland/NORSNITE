import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase/client'
import { getLeague, LEAGUE_DIFFICULTY_FLOOR } from '@/lib/xp'

interface Props {
  userId: string
  currentDifficulty: number
  totalXp: number
  onDone: () => void
}

type Vote = 'easy' | 'ok' | 'hard'

const OPTIONS: { vote: Vote; emoji: string; label: string; delta: number }[] = [
  { vote: 'easy', emoji: '😴', label: 'For lett!', delta: +1 },
  { vote: 'ok',   emoji: '😊', label: 'Passe!',   delta:  0 },
  { vote: 'hard', emoji: '😤', label: 'Vanskelig!', delta: -1 },
]

export default function DifficultyCheck({ userId, currentDifficulty, totalXp, onDone }: Props) {
  const [saving, setSaving] = useState(false)

  async function handleVote(delta: number) {
    setSaving(true)
    const league = getLeague(totalXp)
    const floor = LEAGUE_DIFFICULTY_FLOOR[league]
    const newDifficulty = Math.max(floor, Math.min(10, currentDifficulty + delta))

    await supabase
      .from('profiles')
      .update({ difficulty_level: newDifficulty })
      .eq('id', userId)

    setSaving(false)
    onDone()
  }

  return (
    <AnimatePresence>
      <motion.div
        key="difficulty-check"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        className="w-full max-w-sm rounded-3xl border-2 border-white/20 overflow-hidden"
        style={{ background: 'var(--surface)' }}
      >
        {/* Viking speech bubble header */}
        <div className="flex items-center gap-3 px-5 pt-5 pb-3">
          <span className="text-4xl">🧙</span>
          <div className="bg-white/10 rounded-2xl px-4 py-2 flex-1">
            <p className="text-white font-bold text-sm leading-snug">
              Hva synes du om vanskelighetsgraden?
            </p>
          </div>
        </div>

        {/* Vote buttons */}
        <div className="flex gap-3 px-5 pb-5 pt-1">
          {OPTIONS.map(({ vote, emoji, label, delta }) => (
            <button
              key={vote}
              disabled={saving}
              onClick={() => handleVote(delta)}
              className="flex-1 flex flex-col items-center gap-1.5 py-3 px-2 rounded-2xl
                         bg-white/10 border-2 border-white/20
                         hover:bg-white/20 active:scale-[0.96] transition-all
                         disabled:opacity-40"
            >
              <span className="text-3xl leading-none">{emoji}</span>
              <span className="text-white font-bold text-xs leading-tight text-center">{label}</span>
            </button>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
