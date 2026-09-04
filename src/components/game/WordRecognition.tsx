import type { WordRecognitionQuestion } from '@/content/types'

interface Props {
    question: WordRecognitionQuestion
    onAnswer: (correct: boolean) => void
    disabled: boolean
}

// Three distinct text sizes per question — the options must never be matchable
// by width or shape, only by reading them. Which option gets which size comes
// from question.sizeOrder, reshuffled per question by the content selector.
// The tier is picked off the longest word so a 11-letter word can't overflow
// 390px: at text-5xl that would need ~290px of the ~358px available.
const SIZE_TIERS = [
    ['text-5xl', 'text-4xl', 'text-3xl'], // ≤ 5 letters
    ['text-4xl', 'text-3xl', 'text-2xl'], // 6-8 letters
    ['text-3xl', 'text-2xl', 'text-xl'],  // 9+ letters
]

function sizesFor(words: string[]): string[] {
    const longest = Math.max(...words.map(w => w.length))
    if (longest <= 5) return SIZE_TIERS[0]
    if (longest <= 8) return SIZE_TIERS[1]
    return SIZE_TIERS[2]
}

export default function WordRecognition({ question, onAnswer, disabled }: Props) {
    const sizes = sizesFor(question.choices)

    return (
        <div className="flex flex-col items-center gap-9 w-full">
            <div className="text-center w-full max-w-sm">
                <p className="text-xl font-bold tracking-wide text-[var(--muted)] mb-2">
                    Finn ordet som er likt
                </p>
                <p className=" font-bold tracking-wide text-[var(--muted)] mb-2">
                    Raskere svar gir mer poeng!
                </p>
                <div className="rounded-2xl bg-white/5 border-3 border-purple-400/40 py-3 px-4">
                    <p className={`${sizes[0]} font-black text-white tracking-wide break-words`}>
                        {question.target}
                    </p>
                </div>
            </div>

            {/* gap-3 here against the parent's gap-9 above: the 3× difference is
                what makes the target read as a separate reference rather than a
                fourth button. */}
            <div className="flex flex-col gap-3 w-full max-w-sm">
                {question.choices.map((choice, i) => (
                    <button
                        key={`${i}-${choice}`}
                        disabled={disabled}
                        onClick={() => onAnswer(choice === question.target)}
                        className={`w-full min-h-[64px] py-3 px-4 rounded-2xl bg-white/10 border-2 border-white/20
                       text-white font-black text-center tracking-wide break-words
                       hover:bg-white/20 active:scale-[0.98] transition-all
                       disabled:opacity-50 disabled:cursor-not-allowed ${sizes[question.sizeOrder[i]]}`}
                    >
                        {choice}
                    </button>
                ))}
            </div>
        </div>
    )
}
