import { words, getWordsByCategory, getWordsForDifficulty } from './words'
import { spellWords, getSpellWordsForDifficulty } from './spellWords'
import { sentences } from './sentences'
import { wordOrderQuestions } from './wordOrder'
import { comprehensionQuestions } from './comprehension'
import { punctuationQuestions } from './punctuation'
import { synonymQuestions, getSynonymForDifficulty } from './synonyms'
import { antonymQuestions, getAntonymForDifficulty } from './antonyms'
import type {
  Question,
  Word,
  WordToImageQuestion,
  ImageToWordQuestion,
  FillInQuestion,
  WordOrderQuestion,
  ComprehensionQuestion,
  SpellItQuestion,
  PunctuationQuestion,
  SynonymQuestion,
  AntonymQuestion,
  QuestionType,
} from './types'

export type { Question, Word, QuestionType }
export type {
  WordToImageQuestion,
  ImageToWordQuestion,
  FillInQuestion,
  WordOrderQuestion,
  ComprehensionQuestion,
  SpellItQuestion,
  PunctuationQuestion,
  SynonymQuestion,
  AntonymQuestion,
}
export { words, getWordsByCategory, getWordsForDifficulty }
export { spellWords, getSpellWordsForDifficulty }
export { sentences }
export { wordOrderQuestions }
export { comprehensionQuestions }
export { punctuationQuestions }
export { synonymQuestions, getSynonymForDifficulty }
export { antonymQuestions, getAntonymForDifficulty }

// Fisher-Yates shuffle
export function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Build a word_to_image question for a given word
export function buildWordToImage(target: Word, difficulty: number): WordToImageQuestion {
  const pool = words.filter(w => w.category === target.category && w.id !== target.id)
  const choiceCount = difficulty <= 4 ? 2 : 3 // 3 or 4 total choices
  const wrong = shuffleArray(pool).slice(0, choiceCount)
  return {
    type: 'word_to_image',
    id: `wti-${target.id}`,
    difficulty,
    word: target,
    choices: shuffleArray([target, ...wrong]),
  }
}

// Build an image_to_word question for a given word
export function buildImageToWord(target: Word, difficulty: number): ImageToWordQuestion {
  const pool = words.filter(w => w.category === target.category && w.id !== target.id)
  const choiceCount = difficulty <= 4 ? 2 : 3
  const wrong = shuffleArray(pool).slice(0, choiceCount)
  return {
    type: 'image_to_word',
    id: `itw-${target.id}`,
    difficulty,
    target,
    choices: shuffleArray([target, ...wrong]),
  }
}

// Build a spell_it question for a given word
export function buildSpellIt(target: Word, difficulty: number): SpellItQuestion {
  return {
    type: 'spell_it',
    id: `si-${target.id}`,
    difficulty,
    word: target,
  }
}

// Get fill-in questions for a difficulty level
export function getFillInForDifficulty(difficulty: number): FillInQuestion[] {
  return sentences
    .filter(s => Math.abs(s.difficulty - difficulty) <= 1)
    .map(s => ({
      type: 'fill_in' as const,
      id: s.id,
      difficulty: s.difficulty,
      sentence: s.sentence,
      correct: s.correct,
      choices: shuffleArray(s.choices),
    }))
}

// Get word-order questions for a difficulty level
export function getWordOrderForDifficulty(difficulty: number): WordOrderQuestion[] {
  return wordOrderQuestions
    .filter(q => Math.abs(q.difficulty - difficulty) <= 1)
}

// Get punctuation questions for a difficulty level
export function getPunctuationForDifficulty(difficulty: number): PunctuationQuestion[] {
  return punctuationQuestions.filter(q => Math.abs(q.difficulty - difficulty) <= 1)
}

export function getSynonymsForDifficulty(difficulty: number): SynonymQuestion[] {
  return getSynonymForDifficulty(difficulty)
}

export function getAntonymsForDifficulty(difficulty: number): AntonymQuestion[] {
  return getAntonymForDifficulty(difficulty)
}

// Pick a random question of any type for a given difficulty level.
// excludeIds prevents repeating questions in the same round.
export function pickRandomQuestion(
  difficulty: number,
  excludeIds: string[] = [],
  preferredTypes?: QuestionType[],
): Question | null {
  const types: QuestionType[] = preferredTypes ?? [
    'word_to_image',
    'image_to_word',
    'fill_in',
    'word_order',
    'spell_it',
    'punctuation',
    'synonym',
    'antonym',
    // comprehension kept for longer sessions; add to preferredTypes if needed
  ]
  const type = types[Math.floor(Math.random() * types.length)]

  if (type === 'fill_in') {
    const pool = getFillInForDifficulty(difficulty).filter(q => !excludeIds.includes(q.id))
    if (!pool.length) return null
    return pool[Math.floor(Math.random() * pool.length)]
  }

  if (type === 'word_order') {
    const pool = getWordOrderForDifficulty(difficulty).filter(q => !excludeIds.includes(q.id))
    if (!pool.length) return null
    return pool[Math.floor(Math.random() * pool.length)]
  }

  if (type === 'punctuation') {
    const pool = getPunctuationForDifficulty(difficulty).filter(q => !excludeIds.includes(q.id))
    if (!pool.length) return null
    return pool[Math.floor(Math.random() * pool.length)]
  }

  if (type === 'comprehension') {
    const pool = comprehensionQuestions
      .filter(q => Math.abs(q.difficulty - difficulty) <= 1 && !excludeIds.includes(q.id))
    if (!pool.length) return null
    return pool[Math.floor(Math.random() * pool.length)]
  }

  // word_to_image, image_to_word use words pool; spell_it uses dedicated spell pool
  if (type === 'word_to_image' || type === 'image_to_word') {
    const wordPool = getWordsForDifficulty(difficulty).filter(w => !excludeIds.includes(w.id))
    if (!wordPool.length) return null
    const word = wordPool[Math.floor(Math.random() * wordPool.length)]
    if (type === 'word_to_image') return buildWordToImage(word, difficulty)
    return buildImageToWord(word, difficulty)
  }

  if (type === 'spell_it') {
    // Use dedicated spell words pool; fall back to regular words if pool is empty
    const spellPool = getSpellWordsForDifficulty(difficulty).filter(w => !excludeIds.includes(w.id))
    const fallbackPool = getWordsForDifficulty(difficulty).filter(w => !excludeIds.includes(w.id))
    const pool = spellPool.length ? spellPool : fallbackPool
    if (!pool.length) return null
    return buildSpellIt(pool[Math.floor(Math.random() * pool.length)], difficulty)
  }

  if (type === 'synonym') {
    const pool = getSynonymForDifficulty(difficulty).filter(q => !excludeIds.includes(q.id))
    if (!pool.length) return null
    return pool[Math.floor(Math.random() * pool.length)]
  }

  if (type === 'antonym') {
    const pool = getAntonymForDifficulty(difficulty).filter(q => !excludeIds.includes(q.id))
    if (!pool.length) return null
    return pool[Math.floor(Math.random() * pool.length)]
  }

  return null
}
