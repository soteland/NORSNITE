import { useEffect } from 'react'
import { speak } from '@/lib/speech'
import type { WordToImageQuestion } from '@/content/types'

interface Props {
    question: WordToImageQuestion
    onAnswer: (correct: boolean) => void
    disabled: boolean
}

export default function WordToImage({ question, onAnswer, disabled }: Props) {
    useEffect(() => { speak(question.word.word) }, [question.id])

    return (
        <div className="flex flex-col items-center gap-6 w-full">
            <div className="text-center">
                <p className="text-3xl font-bold tracking-wide text-[var(--muted)] mb-2">
                    Hvilket bilde passer til ordet?
                </p>
                <h2 className="text-4xl font-black text-white">{question.word.word}</h2>
            </div>

            <div className={`grid gap-4 w-full max-w-sm ${question.choices.length === 4 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                {question.choices.map((choice) => (
                    <button
                        key={choice.id}
                        disabled={disabled}
                        onClick={() => onAnswer(choice.id === question.word.id)}
                        className="aspect-square rounded-2xl bg-white/10 border-2 border-white/20 text-6xl
                       flex items-center justify-center
                       hover:bg-white/20 active:scale-95 transition-all
                       disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {choice.emoji}
                    </button>
                ))}
            </div>
        </div>
    )
}
