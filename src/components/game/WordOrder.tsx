import { useState } from 'react'
import type { WordOrderQuestion } from '@/content/types'

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

interface Props {
  question: WordOrderQuestion
  onAnswer: (correct: boolean) => void
  disabled: boolean
}

export default function WordOrder({ question, onAnswer, disabled }: Props) {
  const [placed, setPlaced] = useState<string[]>([])
  // Shuffle correct order at mount — preserves original casing
  const [remaining, setRemaining] = useState<string[]>(() => shuffleArray(question.correct))

  function placeTile(tile: string, idx: number) {
    setRemaining(r => r.filter((_, i) => i !== idx))
    setPlaced(p => [...p, tile])
  }

  function removeTile(tile: string, idx: number) {
    setPlaced(p => p.filter((_, i) => i !== idx))
    setRemaining(r => [...r, tile])
  }

  function submit() {
    const isCorrect = placed.join(' ') === question.correct.join(' ')
    onAnswer(isCorrect)
  }

  const allPlaced = remaining.length === 0

  return (
    <div className="flex flex-col items-center gap-5 w-full">
      <p className="text-base font-bold tracking-wide text-[var(--muted)]">
        Sett ordene i riktig rekkefølge
      </p>

      {/* Answer area */}
      <div className="min-h-16 w-full max-w-sm bg-white/5 border-2 border-dashed border-white/20 rounded-2xl
                      p-3 flex flex-wrap gap-2 items-center justify-center">
        {placed.length === 0 && (
          <span className="text-[var(--muted)] text-sm">Trykk på ord nedenfor…</span>
        )}
        {placed.map((tile, idx) => (
          <button
            key={`${tile}-${idx}`}
            disabled={disabled}
            onClick={() => removeTile(tile, idx)}
            className="px-3 py-1.5 rounded-xl bg-purple-600/80 border border-purple-400/60
                       text-white font-semibold text-lg
                       hover:bg-purple-500/80 active:scale-95 transition-all"
          >
            {tile}
          </button>
        ))}
      </div>

      {/* Tile pool */}
      <div className="flex flex-wrap gap-2 justify-center w-full max-w-sm">
        {remaining.map((tile, idx) => (
          <button
            key={`${tile}-${idx}`}
            disabled={disabled}
            onClick={() => placeTile(tile, idx)}
            className="px-3 py-1.5 rounded-xl bg-white/10 border-2 border-white/20
                       text-white font-semibold text-lg
                       hover:bg-white/20 active:scale-95 transition-all"
          >
            {tile}
          </button>
        ))}
      </div>

      {allPlaced && (
        <button
          disabled={disabled}
          onClick={submit}
          className="mt-2 px-8 py-3 rounded-2xl bg-green-600 hover:bg-green-500
                     text-white font-black text-lg active:scale-95 transition-all
                     disabled:opacity-50"
        >
          Sjekk svaret ✓
        </button>
      )}
    </div>
  )
}
