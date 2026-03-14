// Shows newly earned achievements on round result screen

import { motion } from 'framer-motion'
import { getAchievement, RARITY_COLORS, RARITY_LABELS } from '@/lib/achievements'

interface Props {
  newKeys: string[]
}

export default function NewAchievements({ newKeys }: Props) {
  if (newKeys.length === 0) return null

  const achievements = newKeys.map(getAchievement).filter(Boolean)

  return (
    <motion.div
      className="w-full max-w-sm space-y-2"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >

      {achievements.map((a, i) => {
        const color = RARITY_COLORS[a!.rarity]
        return (
          <motion.div
            key={a!.key}
            className="flex items-center gap-4 rounded-2xl px-4 py-3"
            style={{
              background: `radial-gradient(ellipse at left, ${color}18 0%, #111 70%)`,
              border: `1px solid ${color}44`,
            }}
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 22, delay: 0.1 + i * 0.08 }}
          >
            {/* Badge circle */}
            <motion.div
              className="shrink-0 flex items-center justify-center rounded-full text-3xl"
              style={{
                width: 60, height: 60,
                background: `radial-gradient(circle, #000 0%, #111 35%, ${color} 100%)`,
                boxShadow: `0 0 14px 4px ${color}aa, 0 0 32px 8px ${color}33`,
                border: `1.5px solid ${color}cc`,
              }}
              animate={{
                boxShadow: [
                  `0 0 14px 4px ${color}aa, 0 0 32px 8px ${color}33`,
                  `0 0 22px 8px ${color}dd, 0 0 48px 14px ${color}55`,
                  `0 0 14px 4px ${color}aa, 0 0 32px 8px ${color}33`,
                ],
              }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            >
              {a!.emoji}
            </motion.div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <p className="font-black text-white text-base leading-tight">{a!.name}</p>
              <p className="text-xs mt-0.5 leading-snug" style={{ color: `${color}cc` }}>
                {a!.description}
              </p>
              <span
                className="inline-block text-[10px] font-bold mt-1 px-2 py-0.5 rounded-full"
                style={{ background: `${color}22`, color }}
              >
                {RARITY_LABELS[a!.rarity]}
              </span>
            </div>
          </motion.div>
        )
      })}
    </motion.div>
  )
}
