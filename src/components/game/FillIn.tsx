import type { FillInQuestion } from '@/content/types'

interface Props {
  question: FillInQuestion
  onAnswer: (correct: boolean) => void
  disabled: boolean
}

function renderSentence(sentence: string) {
  const parts = sentence.split('___')
  return (
    <span>
      {parts[0]}
      <span className="inline-block mx-1 px-3 py-0.5 bg-white/20 rounded-lg font-bold text-yellow-300 min-w-[4rem] text-center">
        ___
      </span>
      {parts[1]}
    </span>
  )
}

export default function FillIn({ question, onAnswer, disabled }: Props) {
  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <div className="text-center max-w-sm">
        <p className="text-sm uppercase tracking-widest text-[var(--muted)] mb-3">
          Fyll inn riktig ord
        </p>
        <p className="text-2xl font-semibold text-white leading-relaxed">
          {renderSentence(question.sentence)}
        </p>
      </div>

      <div className="flex flex-col gap-3 w-full max-w-sm">
        {question.choices.map((choice) => (
          <button
            key={choice}
            disabled={disabled}
            onClick={() => onAnswer(choice === question.correct)}
            className="w-full py-4 px-6 rounded-2xl bg-white/10 border-2 border-white/20
                       text-white text-xl font-bold text-center
                       hover:bg-white/20 active:scale-[0.98] transition-all
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {choice}
          </button>
        ))}
      </div>
    </div>
  )
}
