import { useEffect } from 'react'
import { speak } from '@/lib/speech'
import type { ImageToWordQuestion } from '@/content/types'

interface Props {
    question: ImageToWordQuestion
    onAnswer: (correct: boolean) => void
    disabled: boolean
}

export default function ImageToWord({ question, onAnswer, disabled }: Props) {
    useEffect(() => { speak(question.target.word) }, [question.id])

    return (
        <div className="flex flex-col items-center gap-6 w-full">
            <div className="text-center">
                <p className="text-3xl font-bold tracking-wide text-[var(--muted)] mb-3">
                    Hvilket ord passer til bildet?
                </p>
                <span className="text-9xl">{question.target.emoji}</span>
            </div>

            <div className="flex flex-col gap-3 w-full max-w-sm">
                {question.choices.map((choice) => (
                    <button
                        key={choice.id}
                        disabled={disabled}
                        onClick={() => onAnswer(choice.id === question.target.id)}
                        className="w-full py-4 px-6 rounded-2xl bg-white/10 border-2 border-white/20
                       text-white text-xl font-bold text-center
                       hover:bg-white/20 active:scale-[0.98] transition-all
                       disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {choice.word}
                    </button>
                ))}
            </div>
        </div>
    )
}
