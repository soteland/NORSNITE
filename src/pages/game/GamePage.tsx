import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/lib/auth/AuthContext'
import { useGameStore } from '@/lib/store/gameStore'
import { calculateXp, rollCrown, rollComebackBonus, FAST_ANSWER_MS } from '@/lib/xp'
import { buildRound, getCorrectAnswerText } from '@/lib/roundController'
import { speak, speakThen, playCorrect, playWrong, playRoundDone, playPerfect } from '@/lib/speech'
import { useAchievements } from '@/hooks/useAchievements'
import QuestionCard from '@/components/game/QuestionCard'
import RoundResult from '@/components/game/RoundResult'
import LootBox from '@/components/game/LootBox'
import GameMenu from '@/components/layout/GameMenu'
import type { Database } from '@/lib/supabase/client'
import type { Question, PunctuationQuestion, DoubleConsonantQuestion } from '@/content/types'

import norsniteLogo from '/images/norsnite-logo.png'

type ProfileRow = Database['public']['Tables']['profiles']['Row']
type Phase = 'loading' | 'playing' | 'loot' | 'result' | 'error'

/** The only question types that carry a teachingNote, and so reserve hint space. */
function hasTeachingNote(q: Question): q is PunctuationQuestion | DoubleConsonantQuestion {
  return q.type === 'punctuation' || q.type === 'double_consonant'
}
type AnswerStatus = 'idle' | 'correct' | 'wrong' | 'showing_correct' | 'finishing'

// Wrong-answer pause, split in two: red flash only, then the correct answer is
// revealed. The countdown bar in the feedback banner drains over the sum, so
// these are the single source for both the timeouts and the bar duration.
const WRONG_FLASH_MS = 1000
const WRONG_REVEAL_MS = 2500
const WRONG_TOTAL_MS = WRONG_FLASH_MS + WRONG_REVEAL_MS

export default function GamePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { comebackBonus, activateComeback, clearComeback } = useGameStore()
  const { checkAndGrant } = useAchievements(user?.id)

  const [phase, setPhase] = useState<Phase>('loading')
  const [profileBefore, setProfileBefore] = useState<ProfileRow | null>(null)
  const [profileAfter, setProfileAfter] = useState<ProfileRow | null>(null)
  const [newAchievementKeys, setNewAchievementKeys] = useState<string[]>([])
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
  // Fast-read bonus: counts first-attempt word_recognition answers under
  // FAST_ANSWER_MS. wasFast only drives the ⚡ in the feedback banner.
  const [fastCount, setFastCount] = useState(0)
  const [wasFast, setWasFast] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [confirmSkip, setConfirmSkip] = useState(false)

  // Capture comebackBonus at round start so it doesn't change mid-round
  const comebackAtStart = useRef(false)
  const questionShownAt = useRef(0)

  // ── Init round ────────────────────────────────────────────────────────────
  const initRound = useCallback(async () => {
    if (!user) return
    setPhase('loading')
    setQueue([])
    setQIndex(0)
    setCorrectCount(0)
    setFastCount(0)
    setWasFast(false)
    setUsedSkip(false)
    setAnswerStatus('idle')
    setTeachingNote(null)
    setHintVisible(false)
    setComebackJustActivated(false)
    setNewAchievementKeys([])
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

  // Start the fast-read clock each time a new question appears. Also fires when
  // the round starts playing, so question 1 is timed from when it's visible.
  useEffect(() => { questionShownAt.current = Date.now() }, [qIndex, phase])

  // ── End round ─────────────────────────────────────────────────────────────
  const endRound = useCallback(async (finalCorrect: number, finalSkip: boolean, finalCrown: boolean, finalFast: number, _finalQueue: Question[]) => {
    if (!user || !profileBefore) return

    // originalCount is captured in closure via ref
    const xpResult = calculateXp({
      correct: finalCorrect,
      total: originalCount,
      usedSkip: finalSkip,
      crownActive: finalCrown,
      comebackBonus: comebackAtStart.current,
      fastAnswers: finalFast,
    })

    clearComeback()

    // Play round-end sound immediately
    if (xpResult.isPerfect) playPerfect()
    else playRoundDone()

    // Roll comeback if the round went badly (≤40% correct)
    let activatedComeback = false
    if (rollComebackBonus(finalCorrect, originalCount)) {
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

    // ── Achievement check ─────────────────────────────────────────────────────
    checkAndGrant(updatedProfile).then(newKeys => {
      setNewAchievementKeys(newKeys)
    }).catch(console.error)

    // ── Loot box trigger ──────────────────────────────────────────────────────
    const isFirstEverRound = profileBefore.last_active_date === null
    const normalTrigger = isFirstEverRound || (updatedProfile?.rounds_since_loot ?? 0) >= 5

    // DEV ONLY: 50% chance to show loot box regardless — remove before launch
    const showLoot = import.meta.env.DEV ? Math.random() < 0.5 : normalTrigger

    setPhase(showLoot ? 'loot' : 'result')
  }, [user, profileBefore, originalCount, clearComeback, activateComeback, checkAndGrant])

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
      // Fast-read bonus is word_recognition only, and never on a retry — the
      // kid has already been shown the answer by then.
      const isFast = isFirstAttempt
        && current.type === 'word_recognition'
        && Date.now() - questionShownAt.current <= FAST_ANSWER_MS
      if (isFirstAttempt) setCorrectCount(c => c + 1)
      if (isFast) setFastCount(c => c + 1)
      setWasFast(isFast)
      setAnswerStatus('correct')
      playCorrect()
      speakThen('Riktig!', () => {
        // Don't reset to idle here — advanceQueue does it only for non-final questions
        advanceQueue(qIndex + 1, queue, isFirstAttempt ? correctCount + 1 : correctCount, usedSkip, crownActive, isFast ? fastCount + 1 : fastCount)
      })
    } else {
      setWasFast(false)
      setAnswerStatus('wrong')
      setHintVisible(false)
      playWrong()
      const correctText = getCorrectAnswerText(current)
      speak(correctText)
      if (hasTeachingNote(current)) setTeachingNote(current.teachingNote)
      setTimeout(() => {
        setAnswerStatus('showing_correct')
        // Delay hint reveal so it doesn't appear instantly
        if (hasTeachingNote(current)) {
          setTimeout(() => setHintVisible(true), 700)
        }
        setTimeout(() => {
          // Re-queue this question at the end
          const newQueue = [...queue, current]
          setQueue(newQueue)
          setAnswerStatus('idle')
          setTeachingNote(null)
          setHintVisible(false)
          advanceQueue(qIndex + 1, newQueue, correctCount, usedSkip, crownActive, fastCount)
        }, WRONG_REVEAL_MS)
      }, WRONG_FLASH_MS)
    }
  }

  function handleSkip() {
    if (answerStatus !== 'idle' || !profileBefore || profileBefore.skip_tokens <= 0) return
    setConfirmSkip(true)
  }

  function confirmAndSkip() {
    setConfirmSkip(false)
    setUsedSkip(true)
    advanceQueue(qIndex + 1, queue, correctCount, true, crownActive, fastCount)
  }

  function advanceQueue(
    nextIndex: number,
    currentQueue: Question[],
    currentCorrect: number,
    currentSkip: boolean,
    currentCrown: boolean,
    currentFast: number,
  ) {
    if (nextIndex >= currentQueue.length) {
      // Lock buttons immediately — phase stays 'playing' but no more input
      setAnswerStatus('finishing')
      endRound(currentCorrect, currentSkip, currentCrown, currentFast, currentQueue)
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
        newAchievementKeys={newAchievementKeys}
        onPlayAgain={initRound}
      />
    )
  }

  if (!currentQuestion) return null

  return (
    <div className="min-h-[100dvh] flex flex-col"
         style={{ paddingTop: 'env(safe-area-inset-top)' }}>

      {/* Skip confirm sheet */}
      {confirmSkip && (
        <>
          <div className="fixed inset-0 z-40 bg-black/60" onClick={() => setConfirmSkip(false)} />
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--surface)] border-t border-[var(--border)] rounded-t-3xl px-5 pt-4"
               style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 24px)' }}>
            <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mb-4" />
            <div className="flex items-start gap-3 mb-5">
              <span className="text-4xl">⚡</span>
              <div>
                <p className="text-lg font-black text-white">Bruk hjelpemiddel?</p>
                <p className="text-[var(--muted)] text-sm mt-1 leading-snug">
                  Du hopper over dette spørsmålet og får base-XP for det.
                  Men du mister sjansen for perfekt runde og krone-bonus denne runden.
                </p>
                <p className="text-yellow-400 text-sm font-bold mt-2">
                  Du har {profileBefore?.skip_tokens ?? 0} hjelpemiddel igjen.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmSkip(false)}
                className="flex-1 py-3 rounded-2xl bg-white/10 border border-white/20
                           text-white font-bold text-base hover:bg-white/20 transition"
              >
                Avbryt
              </button>
              <button
                onClick={confirmAndSkip}
                className="flex-1 py-3 rounded-2xl bg-yellow-600 border border-yellow-500
                           text-white font-black text-base hover:bg-yellow-500 transition"
              >
                ⚡ Bruk det!
              </button>
            </div>
          </div>
        </>
      )}

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

      {/* Crown banner — first question only. The 👑 in the top bar is the
          persistent indicator; this block used to render all round and cost
          ~90px of vertical space on a 390x844 screen. */}
      {crownActive && qIndex === 0 && (
        <div className="mx-4 mt-2 px-3 py-1.5 rounded-xl bg-yellow-500/15 border border-yellow-400/30 text-center">
          <p className="text-yellow-200 text-sm font-bold">👑 Du har krone denne runden!</p>
        </div>
      )}

      {/* Comeback bonus indicator */}
      {comebackAtStart.current && (
        <div className="mx-4 mt-2 px-3 py-1.5 rounded-xl bg-yellow-600/20 border border-yellow-500/30 text-center">
          <p className="text-yellow-300 text-sm font-bold">⚡ COMEBACK-BONUS aktiv! +25% XP denne runden</p>
        </div>
      )}

      {/* Feedback — always reserved so layout never jumps */}
      <div className="mx-4 mt-3 min-h-[76px]">
        {answerStatus === 'correct' && (
          <div className="rounded-2xl bg-green-500/20 border-2 border-green-400/50 py-4 text-center">
            {/* ⚡ appended inline rather than on its own row — a second line
                would push this block past its reserved 76px. */}
            <p className="text-green-300 font-black text-3xl">
              ✓ Riktig!{wasFast && <span className="text-yellow-300"> ⚡ Lynraskt!</span>}
            </p>
          </div>
        )}
        {answerStatus === 'finishing' && (
          <div className="rounded-2xl bg-white/5 border border-white/10 py-4 text-center">
            <p className="text-[var(--muted)] animate-pulse text-sm">Lagrer runde…</p>
          </div>
        )}
        {(answerStatus === 'wrong' || answerStatus === 'showing_correct') && (
          <div className="relative overflow-hidden rounded-2xl bg-red-500/20 border-2 border-red-400/50 py-3 px-4 text-center">
            <p className="text-red-300 font-black text-2xl">✗ Feil!</p>
            {/* Reserved row for correct-answer reveal — always present to hold height */}
            <div className="min-h-[28px] mt-1">
              {answerStatus === 'showing_correct' && (
                <p className="text-white text-lg font-bold">
                  Riktig: <span className="text-yellow-300">{getCorrectAnswerText(currentQuestion)}</span>
                </p>
              )}
            </div>
            {/* Countdown to the next question. Absolutely placed so it costs no
                height, and mounted for both wrong-states so the animation runs
                once across the whole pause instead of restarting halfway. */}
            <div
              className="drain absolute bottom-0 left-0 right-0 h-1.5 bg-red-300/70"
              style={{ animationDuration: `${WRONG_TOTAL_MS}ms` }}
            />
          </div>
        )}
      </div>

      {/* Question — scrolls rather than clipping if a long word or a 4-choice
          grid still exceeds the space (iPhone 12 leaves ~470px here). */}
      <div className="flex-1 flex items-center justify-center px-4 pt-4 pb-2 overflow-y-auto">
        {/* Keyed on qIndex so the zoom+fade replays for every new task (and for
            a re-queued retry, which also re-triggers the read-aloud effects). */}
        <div key={qIndex} className="question-in w-full flex items-center justify-center">
          <QuestionCard
            question={currentQuestion}
            onAnswer={handleAnswer}
            disabled={answerStatus !== 'idle'}
          />
        </div>
      </div>

      {/* Teaching note — BELOW quiz, delayed reveal. Only 'punctuation' and
          'double_consonant' questions carry a teachingNote, so the height is
          reserved only for those; reserving it on every type cost the rest 68px. */}
      {hasTeachingNote(currentQuestion) && (
        <div className="mx-4 mb-4 min-h-[52px]">
          {answerStatus === 'showing_correct' && teachingNote && hintVisible && (
            <div className="rounded-2xl bg-amber-500/20 border-2 border-amber-400/50 px-4 py-3 text-center">
              <p className="text-amber-200 font-bold text-base">💡 {teachingNote}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

