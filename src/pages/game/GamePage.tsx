import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/lib/auth/AuthContext'
import { useGameStore } from '@/lib/store/gameStore'
import { calculateXp, rollCrown } from '@/lib/xp'
import { buildRound, getCorrectAnswerText } from '@/lib/roundController'
import { speak, speakThen, playCorrect, playWrong, playRoundDone, playPerfect } from '@/lib/speech'
import QuestionCard from '@/components/game/QuestionCard'
import RoundResult from '@/components/game/RoundResult'
import LootBox from '@/components/game/LootBox'
import GameMenu from '@/components/layout/GameMenu'
import type { Database } from '@/lib/supabase/client'
import type { Question } from '@/content/types'

import norsniteLogo from '@/images/norsnite-logo.png'

type ProfileRow = Database['public']['Tables']['profiles']['Row']
type Phase = 'loading' | 'playing' | 'loot' | 'result' | 'error'
type AnswerStatus = 'idle' | 'correct' | 'wrong' | 'showing_correct' | 'finishing'

export default function GamePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { comebackBonus, activateComeback, clearComeback } = useGameStore()

  const [phase, setPhase] = useState<Phase>('loading')
  const [profileBefore, setProfileBefore] = useState<ProfileRow | null>(null)
  const [profileAfter, setProfileAfter] = useState<ProfileRow | null>(null)
  const [queue, setQueue] = useState<Question[]>([])
  const [originalCount, setOriginalCount] = useState(0)
  const [qIndex, setQIndex] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [usedSkip, setUsedSkip] = useState(false)
  const [crownActive, setCrownActive] = useState(false)
  const [answerStatus, setAnswerStatus] = useState<AnswerStatus>('idle')
  const [teachingNote, setTeachingNote] = useState<string | null>(null)
  const [hintVisible, setHintVisible] = useState(false)
  const [comebackJustActivated, setComebackJustActivated] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Capture comebackBonus at round start so it doesn't change mid-round
  const comebackAtStart = useRef(false)

  // ── Init round ────────────────────────────────────────────────────────────
  const initRound = useCallback(async () => {
    if (!user) return
    setPhase('loading')
    setQueue([])
    setQIndex(0)
    setCorrectCount(0)
    setUsedSkip(false)
    setAnswerStatus('idle')
    setTeachingNote(null)
    setHintVisible(false)
    setComebackJustActivated(false)
    setProfileAfter(null)
    comebackAtStart.current = comebackBonus

    try {
      const { data, error } = await supabase.rpc('start_round', { p_user_id: user.id })
      if (error) throw error

      const profile = data as ProfileRow
      setProfileBefore(profile)

      const questions = buildRound(profile.difficulty_level, profile.total_xp)
      if (questions.length === 0) {
        setErrorMsg('Ikke nok spørsmål for dette nivået. Prøv igjen!')
        setPhase('error')
        return
      }

      setQueue(questions)
      setOriginalCount(questions.length)
      setCrownActive(rollCrown())
      setPhase('playing')
    } catch (e) {
      console.error('start_round feilet:', e)
      setErrorMsg('Kunne ikke starte runde. Sjekk tilkoblingen.')
      setPhase('error')
    }
  }, [user, comebackBonus])

  useEffect(() => { initRound() }, []) // run once on mount

  // ── End round ─────────────────────────────────────────────────────────────
  const endRound = useCallback(async (finalCorrect: number, finalSkip: boolean, finalCrown: boolean, _finalQueue: Question[]) => {
    if (!user || !profileBefore) return

    // originalCount is captured in closure via ref
    const xpResult = calculateXp({
      correct: finalCorrect,
      total: originalCount,
      usedSkip: finalSkip,
      crownActive: finalCrown,
      comebackBonus: comebackAtStart.current,
    })

    clearComeback()

    // Play round-end sound immediately
    if (xpResult.isPerfect) playPerfect()
    else playRoundDone()

    // Roll comeback if zero correct
    let activatedComeback = false
    if (finalCorrect === 0 && Math.random() < 0.25) {
      activateComeback()
      activatedComeback = true
    }
    setComebackJustActivated(activatedComeback)

    let updatedProfile: ProfileRow = { ...profileBefore, total_xp: profileBefore.total_xp + xpResult.totalXp }
    try {
      const { data, error } = await supabase.rpc('award_xp', {
        p_user_id: user.id,
        p_xp: xpResult.totalXp,
        p_questions_total: originalCount,
        p_questions_correct: finalCorrect,
        p_crown_round: finalCrown,
        p_crown_win: finalCrown && !finalSkip && finalCorrect === originalCount,
        p_used_skip: finalSkip,
        p_difficulty_level: profileBefore.difficulty_level,
      })
      if (error) throw error
      updatedProfile = data as ProfileRow
    } catch (e) {
      console.error('award_xp feilet:', e)
      // updatedProfile already set to local estimate above
    }

    setProfileAfter(updatedProfile)
    xpResultRef.current = xpResult

    // ── Loot box trigger ──────────────────────────────────────────────────────
    const isFirstEverRound = profileBefore.last_active_date === null
    const normalTrigger = isFirstEverRound || (updatedProfile?.rounds_since_loot ?? 0) >= 5

    // DEV ONLY: 50% chance to show loot box regardless — remove before launch
    const showLoot = import.meta.env.DEV ? Math.random() < 0.5 : normalTrigger

    setPhase(showLoot ? 'loot' : 'result')
  }, [user, profileBefore, originalCount, clearComeback, activateComeback])

  const xpResultRef = useRef<ReturnType<typeof calculateXp> | null>(null)

  // ── Answer handler ────────────────────────────────────────────────────────
  function handleAnswer(isCorrect: boolean) {
    if (answerStatus !== 'idle') return
    const current = queue[qIndex]
    if (!current) return

    setTeachingNote(null)

    if (isCorrect) {
      // Only count first-attempt answers — retries (qIndex >= originalCount) don't qualify for perfect/XP count
      const isFirstAttempt = qIndex < originalCount
      if (isFirstAttempt) setCorrectCount(c => c + 1)
      setAnswerStatus('correct')
      playCorrect()
      speakThen('Riktig!', () => {
        // Don't reset to idle here — advanceQueue does it only for non-final questions
        advanceQueue(qIndex + 1, queue, isFirstAttempt ? correctCount + 1 : correctCount, usedSkip, crownActive)
      })
    } else {
      setAnswerStatus('wrong')
      setHintVisible(false)
      playWrong()
      const correctText = getCorrectAnswerText(current)
      speak(correctText)
      if (current.type === 'punctuation') setTeachingNote(current.teachingNote)
      setTimeout(() => {
        setAnswerStatus('showing_correct')
        // Delay hint reveal so it doesn't appear instantly
        if (current.type === 'punctuation') {
          setTimeout(() => setHintVisible(true), 700)
        }
        setTimeout(() => {
          // Re-queue this question at the end
          const newQueue = [...queue, current]
          setQueue(newQueue)
          setAnswerStatus('idle')
          setTeachingNote(null)
          setHintVisible(false)
          advanceQueue(qIndex + 1, newQueue, correctCount, usedSkip, crownActive)
        }, 2500)
      }, 1000)
    }
  }

  function handleSkip() {
    if (answerStatus !== 'idle' || !profileBefore || profileBefore.skip_tokens <= 0) return
    setUsedSkip(true)
    // advanceQueue sets phase='loading' via endRound if this is the last question
    advanceQueue(qIndex + 1, queue, correctCount, true, crownActive)
  }

  function advanceQueue(
    nextIndex: number,
    currentQueue: Question[],
    currentCorrect: number,
    currentSkip: boolean,
    currentCrown: boolean,
  ) {
    if (nextIndex >= currentQueue.length) {
      // Lock buttons immediately — phase stays 'playing' but no more input
      setAnswerStatus('finishing')
      endRound(currentCorrect, currentSkip, currentCrown, currentQueue)
    } else {
      setAnswerStatus('idle')
      setQIndex(nextIndex)
    }
  }

  // ── Derived values ────────────────────────────────────────────────────────
  const currentQuestion = queue[qIndex]
  const isInRetry = qIndex >= originalCount
  const progressLabel = isInRetry
    ? `Øving ${qIndex - originalCount + 1} 📚`
    : `${qIndex + 1} / ${originalCount}`

  const canSkip = !usedSkip && (profileBefore?.skip_tokens ?? 0) > 0

  // ── Render ────────────────────────────────────────────────────────────────
  if (phase === 'loading') {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center">
        <p className="text-[var(--muted)] animate-pulse text-lg">Laster runde…</p>
      </div>
    )
  }

  if (phase === 'error') {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="text-red-400 text-lg">{errorMsg}</p>
        <button
          onClick={() => navigate({ to: '/' })}
          className="px-6 py-3 rounded-xl bg-white/10 text-white font-bold hover:bg-white/20 transition"
        >
          Tilbake til hjem
        </button>
      </div>
    )
  }

  if (phase === 'loot' && user) {
    return <LootBox userId={user.id} onComplete={() => setPhase('result')} />
  }

  if (phase === 'result' && profileBefore && profileAfter && xpResultRef.current) {
    return (
      <RoundResult
        profileBefore={profileBefore}
        profileAfter={profileAfter}
        xpResult={xpResultRef.current}
        crownActive={crownActive}
        comebackJustActivated={comebackJustActivated}
        onPlayAgain={initRound}
      />
    )
  }

  if (!currentQuestion) return null

  return (
    <div className="min-h-[100dvh] flex flex-col"
         style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        {/* Progress label */}
        <span className="text-sm font-bold text-[var(--muted)] w-20">{progressLabel}</span>
          <img src={norsniteLogo} alt="Norsnite Logo" className="w-34" />
        {/* Crown indicator centered */}
        <span className="text-xl">
          {crownActive ? '👑' : ''}
        </span>

        {/* Skip token + menu */}
        <div className="flex items-center gap-2 w-20 justify-end">
          {canSkip && (
            <button
              onClick={handleSkip}
              disabled={answerStatus !== 'idle'}
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-yellow-600/30 border border-yellow-500/40
                         text-yellow-300 font-bold text-xs hover:bg-yellow-600/50 transition disabled:opacity-40"
              title="Bruk hopp-token"
            >
              ⚡ {profileBefore?.skip_tokens}
            </button>
          )}
          <GameMenu />
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 mx-4 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full bg-purple-500 rounded-full transition-all duration-500"
          style={{ width: `${Math.min(100, (Math.min(qIndex, originalCount) / originalCount) * 100)}%` }}
        />
          </div>
          
          <span className="text-3xl">
              {crownActive && <div className='text-center flex flex-col mt-4 '>
              <span className='text-5xl'>👑</span>
              <span className='text-xl mt-2'>Du har krone denne runden!</span>
          </div>}
          </span>
          

      {/* Comeback bonus indicator */}
      {comebackAtStart.current && (
        <div className="mx-4 mt-2 px-3 py-1.5 rounded-xl bg-yellow-600/20 border border-yellow-500/30 text-center">
          <p className="text-yellow-300 text-xs font-bold">⚡ COMEBACK-BONUS aktiv! +25% XP denne runden</p>
        </div>
      )}

      {/* Feedback — always reserved so layout never jumps */}
      <div className="mx-4 mt-3 min-h-[76px]">
        {answerStatus === 'correct' && (
          <div className="rounded-2xl bg-green-500/20 border-2 border-green-400/50 py-4 text-center">
            <p className="text-green-300 font-black text-2xl">✓ Riktig!</p>
          </div>
        )}
        {answerStatus === 'finishing' && (
          <div className="rounded-2xl bg-white/5 border border-white/10 py-4 text-center">
            <p className="text-[var(--muted)] animate-pulse text-sm">Lagrer runde…</p>
          </div>
        )}
        {(answerStatus === 'wrong' || answerStatus === 'showing_correct') && (
          <div className="rounded-2xl bg-red-500/20 border-2 border-red-400/50 py-3 px-4 text-center">
            <p className="text-red-300 font-black text-xl">✗ Feil!</p>
            {/* Reserved row for correct-answer reveal — always present to hold height */}
            <div className="min-h-[28px] mt-1">
              {answerStatus === 'showing_correct' && (
                <p className="text-white font-bold">
                  Riktig: <span className="text-yellow-300">{getCorrectAnswerText(currentQuestion)}</span>
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Question */}
      <div className="flex-1 flex items-center justify-center px-4 pt-4 pb-2">
        <QuestionCard
          question={currentQuestion}
          onAnswer={handleAnswer}
          disabled={answerStatus !== 'idle'}
        />
      </div>

      {/* Teaching note — BELOW quiz, reserved space, delayed reveal */}
      <div className="mx-4 mb-4 min-h-[52px]">
        {answerStatus === 'showing_correct' && teachingNote && hintVisible && (
          <div className="rounded-2xl bg-amber-500/20 border-2 border-amber-400/50 px-4 py-3 text-center">
            <p className="text-amber-200 font-bold text-sm">💡 {teachingNote}</p>
          </div>
        )}
      </div>
    </div>
  )
}

