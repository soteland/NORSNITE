import { getLeague, ROUND_LENGTH, LEAGUES, type League } from './xp'
import { pickRandomQuestion } from '../content'
import type { Question, QuestionType } from '../content'

const LEAGUE_ORDER: League[] = [...LEAGUES] // Bronze → Unreal

/** Minigame types unlocked at each league tier */
const UNLOCK_AT: Partial<Record<League, QuestionType[]>> = {
  Bronze:   ['word_to_image', 'image_to_word'],
  Silver:   ['fill_in', 'punctuation'],
  Gold:     ['spell_it'],
  Platinum: ['word_order'],
  Diamond:  ['comprehension'],
}

/** Returns all minigame types available at the given league */
export function getAvailableTypes(league: League): QuestionType[] {
  const idx = LEAGUE_ORDER.indexOf(league)
  const types: QuestionType[] = []
  for (let i = 0; i <= idx; i++) {
    const unlocks = UNLOCK_AT[LEAGUE_ORDER[i]]
    if (unlocks) types.push(...unlocks)
  }
  return types
}

/** Builds a round of N questions for the given difficulty + total XP */
export function buildRound(difficulty: number, totalXp: number): Question[] {
  const league = getLeague(totalXp)
  const count = ROUND_LENGTH[league]
  const availableTypes = getAvailableTypes(league)

  const questions: Question[] = []
  const usedIds: string[] = []

  // Try up to 5× count to fill the round (pool may be smaller than count at low difficulty)
  let attempts = 0
  while (questions.length < count && attempts < count * 5) {
    attempts++
    const q = pickRandomQuestion(difficulty, usedIds, availableTypes)
    if (q) {
      questions.push(q)
      usedIds.push(q.id)
    }
  }

  return questions
}

/** Returns the spoken text for the correct answer of any question type */
export function getCorrectAnswerText(q: Question): string {
  switch (q.type) {
    case 'word_to_image':  return q.word.word
    case 'image_to_word':  return q.target.word
    case 'fill_in':        return q.correct
    case 'punctuation':    return q.correct
    case 'word_order':     return q.correct.join(' ')
    case 'comprehension':  return q.correct
    case 'spell_it':       return q.word.word
  }
}
