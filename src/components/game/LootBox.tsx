import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase/client'
import chestVanlig from '@/images/chest-vanlig.png'
import chestSjelden from '@/images/chest-sjelden.png'
import chestEpisk from '@/images/chest-episk.png'
import chestMytisk from '@/images/chest-mytisk.png'
import chestLegendarisk from '@/images/chest-legendarisk.png'

interface Props {
    userId: string
    onComplete: () => void
}

type Rarity = 'vanlig' | 'sjelden' | 'episk' | 'mytisk' | 'legendarisk'
type Phase = 'intro' | 'rolled1' | 'rolled2' | 'applying' | 'revealed'

const CHEST_IMG: Record<Rarity, string> = {
    vanlig: chestVanlig,
    sjelden: chestSjelden,
    episk: chestEpisk,
    mytisk: chestMytisk,
    legendarisk: chestLegendarisk,
}

const RARITY_STYLE: Record<Rarity, { color: string; label: string; glow: string; textColor: string }> = {
    vanlig: { color: '#6b7280', label: 'Vanlig', glow: 'rgba(107,114,128,0.35)', textColor: '#9ca3af' },
    sjelden: { color: '#3b82f6', label: 'Sjelden', glow: 'rgba(59,130,246,0.40)', textColor: '#60a5fa' },
    episk: { color: '#a855f7', label: 'Episk', glow: 'rgba(168,85,247,0.45)', textColor: '#c084fc' },
    mytisk: { color: '#10b981', label: 'Mytisk', glow: 'rgba(16,185,129,0.45)', textColor: '#6ee7b7' },
    legendarisk: { color: '#f59e0b', label: 'Legendarisk', glow: 'rgba(245,158,11,0.50)', textColor: '#fcd34d' },
}

interface Reward { xp: number; skip: number; shield: number }

/**
 * Vanlig / Sjelden → fixed XP reward.
 * Episk / Legendarisk → random roll against loot table at chest-open time.
 *
 * Episk table:
 *   60% → XP 80–160
 *   15% → 1 hopp-token
 *   20% → 1-dagers skjold
 *    5% → 2-dagers skjold
 *
 * Legendarisk table:
 *   50% → XP 160–240
 *   20% → 1 hopp-token
 *   18% → 1-dagers skjold
 *    6% → 2-dagers skjold
 *    4% → 3-dagers skjold
 *    2% → 5-dagers skjold
 */
function rollReward(rarity: Rarity): Reward {
    if (rarity === 'vanlig') return { xp: 25, skip: 0, shield: 0 }
    if (rarity === 'sjelden') {
        const r = Math.random()
        if (r < 0.80) return { xp: 40, skip: 0, shield: 0 }
        if (r < 0.90) return { xp: 0, skip: 1, shield: 0 }
        return { xp: 0, skip: 0, shield: 1 }
    }

    const r = Math.random()

    if (rarity === 'episk') {
        if (r < 0.65) return { xp: 60 + Math.floor(Math.random() * 81), skip: 0, shield: 0 }
        if (r < 0.80) return { xp: 0, skip: 1, shield: 0 }
        if (r < 0.95) return { xp: 0, skip: 0, shield: 1 }
        return { xp: 0, skip: 0, shield: 2 }
    }

    //change this
    if (rarity === 'mytisk') {
        if (r < 0.60) return { xp: 100 + Math.floor(Math.random() * 81), skip: 0, shield: 0 }
        if (r < 0.75) return { xp: 0, skip: 1, shield: 0 }
        if (r < 0.95) return { xp: 0, skip: 0, shield: 1 }
        return { xp: 0, skip: 0, shield: 2 }
    }

    // legendarisk
    if (r < 0.50) return { xp: 160 + Math.floor(Math.random() * 81), skip: 0, shield: 0 }
    if (r < 0.70) return { xp: 0, skip: 1, shield: 0 }
    if (r < 0.88) return { xp: 0, skip: 0, shield: 1 }
    if (r < 0.94) return { xp: 0, skip: 0, shield: 2 }
    if (r < 0.98) return { xp: 0, skip: 0, shield: 3 }

    // 2% chance for 5-dagers skjold
    return { xp: 0, skip: 0, shield: 5 }
}

/** Roll for rarity upgrade after each click */
function rollUpgrade(current: Rarity): Rarity {
    const r = Math.random()
    if (current === 'vanlig') {
        if (r < 0.40) return 'sjelden'
        if (r < 0.65) return 'episk'
        if (r < 0.75) return 'mytisk'
        return 'vanlig'
    }
    if (current === 'sjelden') {
        if (r < 0.50) return 'episk'
        if (r < 0.75) return 'mytisk'
        if (r < 0.85) return 'legendarisk'
        return 'sjelden'
    }
    if (current === 'episk') {
        if (r < 0.20) return 'mytisk'
        if (r < 0.40) return 'legendarisk'
        return 'episk'
    }
    if (current === 'mytisk') {
        if (r < 0.20) return 'legendarisk'
        return 'mytisk'
    }
    return current // legendarisk — can't go higher
}

function rewardLines(reward: Reward): string[] {
    const lines: string[] = []
    if (reward.xp) lines.push(`✨ +${reward.xp} XP`)
    if (reward.skip) lines.push(`⚡ ${reward.skip} hopp-token!`)
    if (reward.shield) lines.push(`🛡️ ${reward.shield}-dagers strekk-skjold!`)
    return lines
}

export default function LootBox({ userId, onComplete }: Props) {
    const [phase, setPhase] = useState<Phase>('intro')
    const [rarity, setRarity] = useState<Rarity>('vanlig')
    const [prev, setPrev] = useState<Rarity | null>(null)
    const [shakeKey, setShakeKey] = useState(0)
    const [reward, setReward] = useState<Reward | null>(null)
    const applyingRef = useRef(false)

    // Auto-close after reveal
    useEffect(() => {
        if (phase === 'revealed') {
            const t = setTimeout(onComplete, 4000)
            return () => clearTimeout(t)
        }
    }, [phase, onComplete])

    async function applyRewards(finalRarity: Rarity) {
        if (applyingRef.current) return
        applyingRef.current = true
        setPhase('applying')

        const rolled = rollReward(finalRarity)
        setReward(rolled)

        try {
            const { data: profile } = await supabase
                .from('profiles')
                .select('total_xp, skip_tokens, streak_shield_days')
                .eq('id', userId)
                .single()

            if (profile) {
                await supabase.from('profiles').update({
                    total_xp: profile.total_xp + rolled.xp,
                    skip_tokens: Math.min(5, profile.skip_tokens + rolled.skip),
                    streak_shield_days: Math.min(7, profile.streak_shield_days + rolled.shield),
                    rounds_since_loot: 0,
                }).eq('id', userId)
            }
        } catch {
            // Non-fatal — still show the reward screen
        }
        setPhase('revealed')
    }

    function handleTap() {
        if (phase === 'applying') return
        if (phase === 'revealed') { onComplete(); return }

        setShakeKey(k => k + 1)

        if (phase === 'intro') {
            const next = rollUpgrade('vanlig')
            setPrev(next !== 'vanlig' ? 'vanlig' : null)
            setRarity(next)
            setPhase('rolled1')
        } else if (phase === 'rolled1') {
            const next = rollUpgrade(rarity)
            setPrev(next !== rarity ? rarity : null)
            setRarity(next)
            setPhase('rolled2')
        } else {
            // Final tap — apply & reveal
            applyRewards(rarity)
        }
    }

    const style = RARITY_STYLE[rarity]
    const upgraded = prev !== null && prev !== rarity
    const stepLabels: Record<Phase, string> = {
        intro: 'Trykk for å riste kisten! 📦',
        rolled1: upgraded ? `🌟 Den glitrer… trykk igjen!` : 'Hmm… trykk igjen! 👀',
        rolled2: upgraded ? `🔥 Den lyser! Åpne nå!` : 'Siste sjanse — åpne! 🔥',
        applying: 'Åpner…',
        revealed: '',
    }

    return (
        <div
            className="fixed inset-0 z-50 flex flex-col items-center justify-center
                 bg-black/92 text-center px-6"
            style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
            onClick={phase !== 'applying' && phase !== 'revealed' ? handleTap : undefined}
        >
            <AnimatePresence mode="wait">
                {phase !== 'revealed' ? (
                    <motion.div
                        key="opening"
                        className="flex flex-col items-center gap-8 w-full"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.25 }}
                    >
                        <p className="text-white/60 text-sm uppercase tracking-widest min-h-[1.5rem]">
                            {stepLabels[phase]}
                        </p>

                        {/* Chest image */}
                        <motion.div
                            key={`chest-${rarity}-${shakeKey}`}
                            className="relative flex items-center justify-center"
                            animate={phase !== 'applying' ? {
                                rotate: [0, -14, 14, -10, 10, -6, 6, 0],
                                scale: [1, 1.06, 1.10, 1.06, 1.04, 1.02, 1.01, 1],
                            } : {}}
                            transition={{ duration: 0.55, ease: 'easeInOut' }}
                        >
                            {/* Rarity glow — intensifies with rarity */}
                            {rarity !== 'vanlig' && (
                                <motion.div
                                    className="absolute inset-0 rounded-full blur-2xl"
                                    style={{ background: style.glow }}
                                    animate={{ opacity: [0.6, 1, 0.6], scale: [0.9, 1.1, 0.9] }}
                                    transition={{ duration: 1.6, repeat: Infinity }}
                                />
                            )}
                            <motion.img
                                key={rarity}
                                src={CHEST_IMG[rarity]}
                                alt={`kiste ${style.label}`}
                                className="w-48 h-48 object-contain relative z-10 drop-shadow-2xl select-none"
                                initial={{ scale: 0.7, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                            />
                        </motion.div>

                        {/* Upgraded flash */}
                        <AnimatePresence>
                            {upgraded && (
                                <motion.p
                                    key={`upgraded-${rarity}`}
                                    className="font-black text-xl"
                                    style={{ color: style.textColor }}
                                    initial={{ opacity: 0, y: 10, scale: 0.8 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0 }}
                                >
                                    {style.label.toUpperCase()}!
                                </motion.p>
                            )}
                        </AnimatePresence>

                        {/* Tap progress dots */}
                        <div className="flex gap-3 mt-2">
                            {(['intro', 'rolled1', 'rolled2'] as Phase[]).map((_p, i) => {
                                const done = ['rolled1', 'rolled2', 'applying', 'revealed'].includes(phase) && i === 0
                                    || ['rolled2', 'applying', 'revealed'].includes(phase) && i === 1
                                    || ['applying', 'revealed'].includes(phase) && i === 2
                                return (
                                    <motion.div
                                        key={i}
                                        className="w-3 h-3 rounded-full"
                                        animate={{ backgroundColor: done ? style.color : 'rgba(255,255,255,0.15)' }}
                                        transition={{ duration: 0.3 }}
                                    />
                                )
                            })}
                        </div>

                        <p className="text-white/30 text-xs">
                            {phase === 'intro' && 'Trykk 3 ganger for å åpne'}
                            {phase === 'rolled1' && '2 trykk igjen'}
                            {phase === 'rolled2' && 'Siste trykk!'}
                            {phase === 'applying' && ''}
                        </p>
                    </motion.div>
                ) : (
                    /* ── REVEAL SCREEN ──────────────────────────────────── */
                    <motion.div
                        key="revealed"
                        className="flex flex-col items-center gap-6"
                        initial={{ opacity: 0, scale: 0.6 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        onClick={onComplete}
                    >
                        <motion.p
                            className="text-white/60 text-sm uppercase tracking-widest"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            Du fikk…
                        </motion.p>

                        {/* Chest with big glow */}
                        <motion.div
                            className="relative flex items-center justify-center"
                            animate={{ rotate: [0, -4, 4, -2, 2, 0] }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                        >
                            <motion.div
                                className="absolute w-56 h-56 rounded-full blur-3xl"
                                style={{ background: style.glow }}
                                animate={{ opacity: [0.7, 1, 0.7], scale: [1, 1.2, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            />
                            <img
                                src={CHEST_IMG[rarity]}
                                alt={style.label}
                                className="w-44 h-44 object-contain relative z-10 drop-shadow-2xl"
                            />
                        </motion.div>

                        {/* Rarity label */}
                        <motion.p
                            className="text-2xl font-black tracking-wide"
                            style={{ color: style.textColor }}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.25 }}
                        >
                            {style.label.toUpperCase()}
                        </motion.p>

                        {/* Reward lines */}
                        <motion.div
                            className="flex flex-col items-center gap-1"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            {reward && rewardLines(reward).map((line, i) => (
                                <p key={i} className="text-2xl font-black text-white">{line}</p>
                            ))}
                        </motion.div>

                        <motion.p
                            className="text-white/30 text-xs mt-2"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1 }}
                        >
                            Trykk for å fortsette
                        </motion.p>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
        @keyframes lootShake {
          0%,100% { transform: rotate(0deg) scale(1); }
          20% { transform: rotate(-12deg) scale(1.05); }
          40% { transform: rotate(12deg) scale(1.10); }
          60% { transform: rotate(-8deg) scale(1.05); }
          80% { transform: rotate(8deg) scale(1.02); }
        }
      `}</style>
        </div>
    )
}

