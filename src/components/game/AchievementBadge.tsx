// Single achievement badge with CSS radial gradient + neon glow
// Tap to show centered detail popup

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { type Achievement, RARITY_COLORS, RARITY_LABELS } from '@/lib/achievements'

interface Props {
    achievement: Achievement
    earned: boolean
    justEarned?: boolean
    size?: 'sm' | 'md'
}

function BadgeCircle({ achievement, earned, dim }: { achievement: Achievement; earned: boolean; dim: number }) {
    const color = RARITY_COLORS[achievement.rarity]
    const emojiSize = dim >= 72 ? 'text-4xl' : dim >= 96 ? 'text-5xl' : 'text-2xl'

    const style: React.CSSProperties = earned
        ? {
            width: dim, height: dim, borderRadius: '50%',
            background: `radial-gradient(circle, #000 0%, #111 35%, ${color} 100%)`,
            boxShadow: `0 0 12px 4px ${color}cc, 0 0 40px 12px ${color}4d`,
            border: `1.5px solid ${color}e6`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }
        : {
            width: dim, height: dim, borderRadius: '50%',
            background: `radial-gradient(circle, #000 0%, #111 35%, #444 100%)`,
            border: '1.5px solid #555',
            filter: 'grayscale(100%) brightness(0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }

    return (
        <div style={style}>
            <span className={emojiSize}>{earned ? achievement.emoji : '🔒'}</span>
        </div>
    )
}

export default function AchievementBadge({ achievement, earned, justEarned = false, size = 'md' }: Props) {
    const [showDetail, setShowDetail] = useState(false)
    const color = RARITY_COLORS[achievement.rarity]
    const dim = size === 'sm' ? 56 : 72
    const nameSize = size === 'sm' ? 'text-[10px]' : 'text-xs'

    const badge = (
        <button
            type="button"
            onClick={() => setShowDetail(true)}
            className="flex flex-col items-center gap-1 focus:outline-none active:scale-95 transition-transform"
            style={{ width: dim + 16 }}
            aria-label={`${achievement.name} — trykk for mer info`}
        >
            <BadgeCircle achievement={achievement} earned={earned} dim={dim} />
            <span className={`${nameSize} font-bold text-center leading-tight ${earned ? 'text-white' : 'text-white/30'}`}>
                {achievement.name}
            </span>
        </button>
    )

    return (
        <>
            {justEarned ? (
                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: [0, 1.2, 1], opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                >
                    <motion.div
                        animate={{
                            boxShadow: [
                                `0 0 12px 4px ${color}cc, 0 0 40px 12px ${color}4d`,
                                `0 0 24px 8px ${color}ff, 0 0 60px 20px ${color}80`,
                                `0 0 12px 4px ${color}cc, 0 0 40px 12px ${color}4d`,
                            ],
                        }}
                        transition={{ duration: 1.5, repeat: 2 }}
                        style={{ borderRadius: '50%', display: 'inline-flex' }}
                    >
                        {badge}
                    </motion.div>
                </motion.div>
            ) : badge}

            {/* Detail popup */}
            <AnimatePresence>
                {showDetail && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            className="fixed inset-0 z-50 bg-black/70"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setShowDetail(false)}
                        />

                        {/* Card */}
                        <motion.div
                            className="fixed inset-0 z-50 flex items-center justify-center p-8 pointer-events-none"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                        >
                            <div
                                className="pointer-events-auto rounded-3xl p-8 flex flex-col items-center gap-4 text-center max-w-xs w-full"
                                style={{
                                    background: `radial-gradient(ellipse at top, ${color}22 0%, #111 60%)`,
                                    border: `1.5px solid ${color}55`,
                                    boxShadow: `0 0 40px 8px ${color}33`,
                                }}
                                onClick={e => e.stopPropagation()}
                            >
                                {/* Large badge */}
                                <BadgeCircle achievement={achievement} earned={earned} dim={112} />

                                {/* Name + rarity */}
                                <div>
                                    <p className="text-2xl font-black text-white">{earned ? achievement.name : '???'}</p>
                                    <p className="text-sm font-bold mt-0.5" style={{ color }}>
                                        {RARITY_LABELS[achievement.rarity]}
                                    </p>
                                </div>

                                {/* Description */}
                                <p className="text-[var(--muted)] text-sm leading-snug">
                                    {earned ? achievement.description : 'Lås opp for å se hva det er!'}
                                </p>

                                {/* Status */}
                                <div
                                    className="px-4 py-1.5 rounded-full text-xs font-bold"
                                    style={earned
                                        ? { background: `${color}22`, color }
                                        : { background: 'rgba(255,255,255,0.05)', color: 'var(--muted)' }
                                    }
                                >
                                    {earned ? '✓ Du har denne!' : '🔒 Ikke vunnet enda'}
                                </div>

                                <button
                                    onClick={() => setShowDetail(false)}
                                    className="mt-1 text-sm text-[var(--muted)] hover:text-white transition"
                                >
                                    Lukk
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    )
}

// Grid of all badges (for profile page)
export function AchievementGrid({
    achievements,
    earnedKeys,
    newKeys = [],
}: {
    achievements: Achievement[]
    earnedKeys: Set<string>
    newKeys?: string[]
}) {
    return (
        <div className="flex flex-wrap justify-center gap-3">
            {achievements.map(a => (
                <AchievementBadge
                    key={a.key}
                    achievement={a}
                    earned={earnedKeys.has(a.key)}
                    justEarned={newKeys.includes(a.key)}
                    size="md"
                />
            ))}
        </div>
    )
}
