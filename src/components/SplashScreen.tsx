import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { supabase } from '@/lib/supabase/client'
import { getCurrentMonthSplash } from '@/lib/splashscreen'

const MIN_DISPLAY_MS = 2000

interface Props {
  onDone: () => void
}

export default function SplashScreen({ onDone }: Props) {
  const { src, month } = getCurrentMonthSplash()
  const [exiting, setExiting] = useState(false)
  const authDoneRef = useRef(false)
  const timerDoneRef = useRef(false)

  function tryComplete() {
    if (authDoneRef.current && timerDoneRef.current) {
      setExiting(true)
    }
  }

  useEffect(() => {
    // Minimum display timer
    const t = setTimeout(() => {
      timerDoneRef.current = true
      tryComplete()
    }, MIN_DISPLAY_MS)

    // Prefetch auth session in background
    supabase.auth.getSession().finally(() => {
      authDoneRef.current = true
      tryComplete()
    })

    return () => clearTimeout(t)
  }, [])

  return (
    <AnimatePresence onExitComplete={onDone}>
      {!exiting && (
        <motion.div
          key="splash"
          className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
          style={{ background: 'var(--bg)' }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Monthly illustration */}
          <motion.div
            className="w-full max-w-sm px-6"
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <img
              src={src}
              alt={month}
              className="w-full h-auto rounded-3xl shadow-2xl object-cover"
              style={{ maxHeight: '55vh' }}
            />
          </motion.div>

          {/* App name */}
          <motion.div
            className="mt-8 text-center"
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <h1 className="text-5xl font-black tracking-tight"
                style={{ color: 'var(--accent)' }}>
              NorsNite
            </h1>
            <p className="mt-1 text-sm font-semibold" style={{ color: 'var(--muted)' }}>
              {month}
            </p>
          </motion.div>

          {/* Loading dots */}
          <motion.div
            className="mt-10 flex gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {[0, 1, 2].map(i => (
              <motion.span
                key={i}
                className="w-2 h-2 rounded-full"
                style={{ background: 'var(--muted)' }}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
