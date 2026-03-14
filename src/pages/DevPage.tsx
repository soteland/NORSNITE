import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useAuth } from '@/lib/auth/AuthContext'
import { supabase } from '@/lib/supabase/client'
import {
  getWordsForDifficulty,
  getSpellWordsForDifficulty,
  getFillInForDifficulty,
  getPunctuationForDifficulty,
  getWordOrderForDifficulty,
  comprehensionQuestions,
  buildWordToImage,
  buildImageToWord,
  buildSpellIt,
  getSynonymForDifficulty,
  getAntonymForDifficulty,
} from '@/content'
import type { Question, QuestionType } from '@/content/types'
import QuestionCard from '@/components/game/QuestionCard'
import LootBox from '@/components/game/LootBox'
import { speak, playCorrect, playWrong } from '@/lib/speech'
import { getCorrectAnswerText } from '@/lib/roundController'
import { ALL_ACHIEVEMENTS, RARITY_COLORS, RARITY_LABELS, type Achievement } from '@/lib/achievements'
import AchievementBadge from '@/components/game/AchievementBadge'

type AnswerStatus = 'idle' | 'correct' | 'wrong' | 'showing_correct'

const TYPES: { type: QuestionType; label: string }[] = [
  { type: 'word_to_image', label: 'Ord → Bilde' },
  { type: 'image_to_word', label: 'Bilde → Ord' },
  { type: 'fill_in',       label: 'Fyll inn' },
  { type: 'punctuation',   label: 'Sett tegnet' },
  { type: 'word_order',    label: 'Ordrekkefølge' },
  { type: 'comprehension', label: 'Les og forstå' },
  { type: 'spell_it',      label: 'Skriv ordet' },
  { type: 'synonym',       label: 'Synonym' },
  { type: 'antonym',       label: 'Motsetning' },
]

function buildQuestion(type: QuestionType, difficulty: number): Question | null {
  if (type === 'fill_in') {
    const pool = getFillInForDifficulty(difficulty)
    if (!pool.length) return null
    return pool[Math.floor(Math.random() * pool.length)]
  }
  if (type === 'punctuation') {
    const pool = getPunctuationForDifficulty(difficulty)
    if (!pool.length) return null
    return pool[Math.floor(Math.random() * pool.length)]
  }
  if (type === 'word_order') {
    const pool = getWordOrderForDifficulty(difficulty)
    if (!pool.length) return null
    return pool[Math.floor(Math.random() * pool.length)]
  }
  if (type === 'comprehension') {
    const pool = comprehensionQuestions.filter(q => Math.abs(q.difficulty - difficulty) <= 1)
    if (!pool.length) return null
    return pool[Math.floor(Math.random() * pool.length)]
  }
  // word_to_image, image_to_word
  if (type === 'word_to_image' || type === 'image_to_word') {
    const pool = getWordsForDifficulty(difficulty)
    if (!pool.length) return null
    const word = pool[Math.floor(Math.random() * pool.length)]
    return type === 'word_to_image' ? buildWordToImage(word, difficulty) : buildImageToWord(word, difficulty)
  }
  if (type === 'synonym') {
    const pool = getSynonymForDifficulty(difficulty)
    if (!pool.length) return null
    return pool[Math.floor(Math.random() * pool.length)]
  }
  if (type === 'antonym') {
    const pool = getAntonymForDifficulty(difficulty)
    if (!pool.length) return null
    return pool[Math.floor(Math.random() * pool.length)]
  }
  // spell_it — use dedicated spell pool, fall back to regular words
  const spellPool = getSpellWordsForDifficulty(difficulty)
  const fallback  = getWordsForDifficulty(difficulty)
  const pool = spellPool.length ? spellPool : fallback
  if (!pool.length) return null
  return buildSpellIt(pool[Math.floor(Math.random() * pool.length)], difficulty)
}

export default function DevPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  // Guard — only available in dev mode
  useEffect(() => {
    if (!import.meta.env.DEV) navigate({ to: '/' })
  }, [navigate])

  const [selectedType, setSelectedType] = useState<QuestionType>('word_to_image')
  const [difficulty, setDifficulty] = useState(2)
  const [question, setQuestion] = useState<Question | null>(null)
  const [questionKey, setQuestionKey] = useState(0)
  const [answerStatus, setAnswerStatus] = useState<AnswerStatus>('idle')
  const [teachingNote, setTeachingNote] = useState<string | null>(null)
  const [hintVisible, setHintVisible] = useState(false)
  const [stats, setStats] = useState({ correct: 0, wrong: 0 })
  const [showLootBox, setShowLootBox] = useState(false)

  // Badge testing
  const [earnedBadges, setEarnedBadges] = useState<Set<string>>(new Set())
  const [badgeTab, setBadgeTab] = useState(false)

  useEffect(() => {
    if (!user) return
    supabase
      .from('earned_achievements')
      .select('achievement_key')
      .eq('user_id', user.id)
      .then(({ data }) => {
        if (data) setEarnedBadges(new Set(data.map(r => r.achievement_key)))
      })
  }, [user])

  async function toggleBadge(achievement: Achievement) {
    if (!user) return
    const key = achievement.key
    if (earnedBadges.has(key)) {
      await supabase.from('earned_achievements')
        .delete()
        .eq('user_id', user.id)
        .eq('achievement_key', key)
      setEarnedBadges(prev => { const n = new Set(prev); n.delete(key); return n })
    } else {
      await supabase.from('earned_achievements')
        .insert({ user_id: user.id, achievement_key: key })
      setEarnedBadges(prev => new Set([...prev, key]))
    }
  }

  async function grantAll() {
    if (!user) return
    const missing = ALL_ACHIEVEMENTS.filter(a => !earnedBadges.has(a.key))
    if (!missing.length) return
    await supabase.from('earned_achievements').insert(
      missing.map(a => ({ user_id: user.id, achievement_key: a.key }))
    )
    setEarnedBadges(new Set(ALL_ACHIEVEMENTS.map(a => a.key)))
  }

  async function revokeAll() {
    if (!user) return
    await supabase.from('earned_achievements').delete().eq('user_id', user.id)
    setEarnedBadges(new Set())
  }

  const nextQuestion = useCallback(() => {
    setQuestion(buildQuestion(selectedType, difficulty))
    setQuestionKey(k => k + 1)
    setAnswerStatus('idle')
    setTeachingNote(null)
    setHintVisible(false)
  }, [selectedType, difficulty])

  // Regenerate when type or difficulty changes
  useEffect(() => { nextQuestion() }, [nextQuestion])

  function handleAnswer(isCorrect: boolean) {
    if (answerStatus !== 'idle' || !question) return
    setTeachingNote(null)

    if (isCorrect) {
      setStats(s => ({ ...s, correct: s.correct + 1 }))
      setAnswerStatus('correct')
      playCorrect()
      speak('Riktig!')
      setTimeout(() => nextQuestion(), 800)
    } else {
      setStats(s => ({ ...s, wrong: s.wrong + 1 }))
      setAnswerStatus('wrong')
      setHintVisible(false)
      playWrong()
      if (question.type === 'punctuation') setTeachingNote(question.teachingNote)
      speak(getCorrectAnswerText(question))
      setTimeout(() => {
        setAnswerStatus('showing_correct')
        if (question.type === 'punctuation') {
          setTimeout(() => setHintVisible(true), 700)
        }
        setTimeout(() => nextQuestion(), 2500)
      }, 800)
    }
  }

  if (!import.meta.env.DEV) return null

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[var(--bg)]"
         style={{ paddingTop: 'env(safe-area-inset-top)' }}>

      {/* Loot box overlay */}
      {showLootBox && user && (
        <LootBox userId={user.id} onComplete={() => setShowLootBox(false)} />
      )}

      {/* Top bar */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2 border-b border-[var(--border)]">
        <button
          onClick={() => navigate({ to: '/spill' })}
          className="text-[var(--muted)] text-sm hover:text-white transition"
        >
          ← Spill
        </button>
        <div className="flex items-center gap-2">
          <span className="text-yellow-400 text-xs font-bold px-2 py-0.5 rounded-full bg-yellow-400/10 border border-yellow-400/30">
            DEV
          </span>
          <h1 className="text-base font-black text-white">Testsider</h1>
        </div>
        {/* Stats */}
        <div className="flex gap-3 text-xs font-bold">
          <span className="text-green-400">✓ {stats.correct}</span>
          <span className="text-red-400">✗ {stats.wrong}</span>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="flex px-4 pt-3 gap-2">
        <button
          onClick={() => setBadgeTab(false)}
          className={`flex-1 py-2 rounded-xl text-sm font-bold transition border
            ${!badgeTab ? 'bg-purple-600/40 border-purple-500/60 text-white' : 'bg-white/5 border-white/10 text-[var(--muted)] hover:bg-white/10'}`}
        >
          🎮 Spørsmål
        </button>
        <button
          onClick={() => setBadgeTab(true)}
          className={`flex-1 py-2 rounded-xl text-sm font-bold transition border
            ${badgeTab ? 'bg-purple-600/40 border-purple-500/60 text-white' : 'bg-white/5 border-white/10 text-[var(--muted)] hover:bg-white/10'}`}
        >
          🏅 Merker
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">

        {/* ── Badge testing panel ── */}
        {badgeTab && (
          <div className="px-4 pt-4 pb-10 space-y-4">
            <p className="text-xs text-[var(--muted)]">
              Trykk på et merke for å gi/fjerne det. Gå til profil for å se resultatet.
            </p>

            {/* Grant/revoke all */}
            <div className="flex gap-2">
              <button
                onClick={grantAll}
                className="flex-1 py-2 rounded-xl bg-green-700/30 border border-green-500/40 text-green-300 text-sm font-bold hover:bg-green-700/50 transition"
              >
                ✓ Gi alle
              </button>
              <button
                onClick={revokeAll}
                className="flex-1 py-2 rounded-xl bg-red-800/30 border border-red-500/40 text-red-400 text-sm font-bold hover:bg-red-800/50 transition"
              >
                ✗ Fjern alle
              </button>
            </div>

            <p className="text-xs text-[var(--muted)] text-center font-mono">
              {earnedBadges.size} / {ALL_ACHIEVEMENTS.length} opptjent
            </p>

            {/* Grouped by rarity */}
            {(['common', 'uncommon', 'rare', 'epic', 'legendary'] as const).map(rarity => {
              const group = ALL_ACHIEVEMENTS.filter(a => a.rarity === rarity)
              return (
                <div key={rarity} className="space-y-2">
                  <p className="text-xs font-bold uppercase tracking-widest"
                     style={{ color: RARITY_COLORS[rarity] }}>
                    {RARITY_LABELS[rarity]}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {group.map(a => (
                      <button
                        key={a.key}
                        onClick={() => toggleBadge(a)}
                        title={`${a.name}: ${a.description}`}
                        className="focus:outline-none active:scale-95 transition-transform"
                      >
                        <AchievementBadge achievement={a} earned={earnedBadges.has(a.key)} size="sm" />
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Quiz panel */}
        {!badgeTab && <>
          {/* Quiz type selector */}
          <div className="px-4 pt-4 pb-2">
            <p className="text-xs uppercase tracking-widest text-[var(--muted)] mb-2">Spørsmålstype</p>
            <div className="grid grid-cols-2 gap-2">
              {TYPES.map(({ type, label }) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`py-2.5 px-3 rounded-xl text-sm font-bold text-left transition border
                    ${selectedType === type
                      ? 'bg-purple-600/40 border-purple-500/60 text-white'
                      : 'bg-white/5 border-white/10 text-[var(--muted)] hover:bg-white/10'
                    }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty selector */}
          <div className="px-4 pt-2 pb-3">
            <p className="text-xs uppercase tracking-widest text-[var(--muted)] mb-2">
              Vanskelighetsgrad — <span className="text-white font-black">Nivå {difficulty}</span>
            </p>
            <div className="flex gap-1.5">
              {Array.from({ length: 10 }, (_, i) => i + 1).map(d => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`flex-1 h-9 rounded-lg text-sm font-black transition border
                    ${difficulty === d
                      ? 'bg-purple-600 border-purple-500 text-white'
                      : 'bg-white/5 border-white/10 text-[var(--muted)] hover:bg-white/10'
                    }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-[var(--border)] mx-4" />

          {/* Answer feedback — fixed height, no jump */}
          <div className="px-4 pt-3 min-h-[88px]">
            {answerStatus === 'correct' && (
              <div className="rounded-2xl bg-green-500/20 border-2 border-green-400/50 py-4 text-center">
                <p className="text-green-300 font-black text-2xl">✓ Riktig!</p>
              </div>
            )}
            {(answerStatus === 'wrong' || answerStatus === 'showing_correct') && question && (
              <div className="rounded-2xl bg-red-500/20 border-2 border-red-400/50 py-3 px-4 text-center">
                <p className="text-red-300 font-black text-xl">✗ Feil!</p>
                <div className="min-h-[28px] mt-1">
                  {answerStatus === 'showing_correct' && (
                    <p className="text-white font-bold">
                      Riktig: <span className="text-yellow-300">{getCorrectAnswerText(question)}</span>
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Teaching note — reserved space, delayed reveal */}
          <div className="px-4 pb-1 min-h-[56px]">
            {answerStatus === 'showing_correct' && teachingNote && hintVisible && (
              <div className="rounded-2xl bg-amber-500/20 border-2 border-amber-400/50 px-4 py-3 text-center">
                <p className="text-amber-200 font-bold text-sm">💡 {teachingNote}</p>
              </div>
            )}
          </div>

          {/* Question */}
          <div className="px-4 pb-4">
            {question ? (
              <QuestionCard
                key={questionKey}
                question={question}
                onAnswer={handleAnswer}
                disabled={answerStatus !== 'idle'}
              />
            ) : (
              <div className="text-center py-12 text-[var(--muted)]">
                <p>Ingen spørsmål tilgjengelig for</p>
                <p className="font-bold">{selectedType} / nivå {difficulty}</p>
                <p className="text-sm mt-1">Prøv et annet nivå</p>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="px-4 pb-6 flex flex-col gap-3">
            <button
              onClick={nextQuestion}
              className="w-full py-3 rounded-2xl bg-white/10 border border-white/20
                         text-white font-bold hover:bg-white/20 transition"
            >
              Neste spørsmål ↻
            </button>

            {user && (
              <button
                onClick={() => setShowLootBox(true)}
                className="w-full py-3 rounded-2xl bg-yellow-600/30 border border-yellow-500/40
                           text-yellow-300 font-bold hover:bg-yellow-600/50 transition"
              >
                📦 Test loot box
              </button>
            )}

            <button
              onClick={() => setStats({ correct: 0, wrong: 0 })}
              className="w-full py-2 rounded-xl text-[var(--muted)] text-sm hover:text-white transition"
            >
              Nullstill statistikk
            </button>
          </div>
        </>}

      </div>
    </div>
  )
}
