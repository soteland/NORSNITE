import { create } from 'zustand'
import type { Question } from '../../content/types'

interface GameStore {
  // Active round state
  roundActive: boolean
  crownActive: boolean        // 10% roll at round start — Zustand only, not persisted
  comebackBonus: boolean      // +25% XP next round — Zustand only, clears on reload
  usedSkipThisRound: boolean  // voids perfect/crown win bonuses
  questionsInRound: Question[]
  currentQuestionIndex: number
  correctThisRound: number
  totalInRound: number

  // Actions
  startRound: (questions: Question[], hasCrown: boolean, hasComeback: boolean) => void
  answerQuestion: (correct: boolean) => void
  useSkip: () => void
  endRound: () => void
  activateComeback: () => void
  clearComeback: () => void
}

export const useGameStore = create<GameStore>((set) => ({
  roundActive: false,
  crownActive: false,
  comebackBonus: false,
  usedSkipThisRound: false,
  questionsInRound: [],
  currentQuestionIndex: 0,
  correctThisRound: 0,
  totalInRound: 0,

  startRound: (questions, hasCrown, hasComeback) =>
    set({
      roundActive: true,
      crownActive: hasCrown,
      comebackBonus: hasComeback,
      usedSkipThisRound: false,
      questionsInRound: questions,
      currentQuestionIndex: 0,
      correctThisRound: 0,
      totalInRound: questions.length,
    }),

  answerQuestion: (correct) =>
    set((s) => ({
      currentQuestionIndex: s.currentQuestionIndex + 1,
      correctThisRound: correct ? s.correctThisRound + 1 : s.correctThisRound,
    })),

  useSkip: () =>
    set((s) => ({
      usedSkipThisRound: true,
      currentQuestionIndex: s.currentQuestionIndex + 1,
      // Skip earns base XP — counted as "not correct" for bonus purposes
    })),

  endRound: () =>
    set({
      roundActive: false,
      crownActive: false,
      comebackBonus: false,
      usedSkipThisRound: false,
      questionsInRound: [],
      currentQuestionIndex: 0,
      correctThisRound: 0,
      totalInRound: 0,
    }),

  activateComeback: () => set({ comebackBonus: true }),
  clearComeback: () => set({ comebackBonus: false }),
}))

/** Derive whether this round qualifies for perfect-round bonus (+25%) */
export function isPerfectRound(state: GameStore): boolean {
  return (
    !state.usedSkipThisRound &&
    state.correctThisRound === state.totalInRound &&
    state.totalInRound > 0
  )
}
