import type { PunctuationQuestion } from '@/content/types'

interface Props {
  question: PunctuationQuestion
  onAnswer: (correct: boolean) => void
  disabled: boolean
}

const CHOICES: PunctuationQuestion['correct'][] = ['.', '?', '!']

export default function Punctuation({ question, onAnswer, disabled }: Props) {
  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <div className="text-center max-w-sm">
        <p className="text-sm uppercase tracking-widest text-[var(--muted)] mb-3">
          Sett riktig tegn til slutt
        </p>
        <p className="text-2xl font-semibold text-white leading-relaxed">
          {question.sentence}
          <span className="text-yellow-300 font-black text-3xl ml-1">_</span>
        </p>
      </div>

      <div className="flex gap-4">
        {CHOICES.map((choice) => (
          <button
            key={choice}
            disabled={disabled}
            onClick={() => onAnswer(choice === question.correct)}
            className="w-24 h-24 rounded-2xl bg-white/10 border-2 border-white/20
                       text-white text-5xl font-black flex items-center justify-center
                       hover:bg-white/20 active:scale-95 transition-all
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {choice}
          </button>
        ))}
      </div>
    </div>
  )
}
