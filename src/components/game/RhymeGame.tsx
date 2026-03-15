import type { RhymeQuestion } from '@/content/types'
import { shuffleArray } from '@/content'
import { useMemo } from 'react'

type Props = {
  question: RhymeQuestion
  onAnswer: (correct: boolean) => void
  disabled: boolean
}

export default function RhymeGame({ question, onAnswer, disabled }: Props) {
  const shuffled = useMemo(() => shuffleArray(question.choices), [question.id])

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <div className="text-center">
        <p className="text-base font-bold tracking-wide text-[var(--muted)] mb-2">
          Hvilket ord rimer?
        </p>
        <h2 className="text-4xl font-black text-white">{question.word}</h2>
      </div>

      <div className={`grid gap-3 w-full max-w-sm ${shuffled.length === 4 ? 'grid-cols-2' : 'grid-cols-3'}`}>
        {shuffled.map((choice) => (
          <button
            key={choice}
            disabled={disabled}
            onClick={() => onAnswer(choice === question.correct)}
            className="py-4 px-2 rounded-2xl bg-white/10 border-2 border-white/20 text-white
                       text-lg font-bold text-center
                       hover:bg-white/20 active:scale-[0.97] transition-all
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {choice}
          </button>
        ))}
      </div>
    </div>
  )
}
