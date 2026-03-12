import { useState, useEffect, useRef } from 'react'
import type { SpellItQuestion } from '@/content/types'
import { shuffleArray } from '@/content'
import { speak } from '@/lib/speech'

const MODE_KEY = 'norsnite-spellit-mode'

type InputMode = 'buttons' | 'keyboard'
type Tile = { id: number; letter: string; used: boolean }

function buildTiles(word: string): Tile[] {
  const letters = word.toUpperCase().split('')
  return shuffleArray(letters).map((letter, i) => ({
    id: i,
    letter,
    used: false,
  }))
}

interface Props {
  question: SpellItQuestion
  onAnswer: (correct: boolean) => void
  disabled: boolean
}

export default function SpellIt({ question, onAnswer, disabled }: Props) {
  const target = question.word.word.toUpperCase()

  const [inputMode, setInputMode] = useState<InputMode>(
    () => (localStorage.getItem(MODE_KEY) as InputMode | null) ?? 'buttons',
  )
  const [tiles, setTiles]       = useState<Tile[]>(() => buildTiles(question.word.word))
  const [typed, setTyped]       = useState<string[]>([])
  const [kbValue, setKbValue]   = useState('')
  const [shake, setShake]       = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Rebuild when question changes
  useEffect(() => {
    setTiles(buildTiles(question.word.word))
    setTyped([])
    setKbValue('')
  }, [question.word.word])

  // Speak the word on mount
  useEffect(() => { speak(question.word.word) }, [question.word.word])

  // Focus keyboard input when switching modes
  useEffect(() => {
    if (inputMode === 'keyboard') setTimeout(() => inputRef.current?.focus(), 80)
  }, [inputMode])

  function switchMode(mode: InputMode) {
    localStorage.setItem(MODE_KEY, mode)
    setInputMode(mode)
    setTyped([])
    setKbValue('')
    setTiles(buildTiles(question.word.word))
  }

  function tapTile(tile: Tile) {
    if (disabled || tile.used) return
    setTiles(prev => prev.map(t => t.id === tile.id ? { ...t, used: true } : t))
    setTyped(prev => [...prev, tile.letter])
  }

  function backspace() {
    if (!typed.length) return
    const lastLetter = typed[typed.length - 1]
    setTyped(prev => prev.slice(0, -1))
    setTiles(prev => {
      const idx = prev.findIndex(t => t.used && t.letter === lastLetter)
      if (idx === -1) return prev
      return prev.map((t, i) => i === idx ? { ...t, used: false } : t)
    })
  }

  function triggerShake() {
    setShake(true)
    setTimeout(() => setShake(false), 500)
  }

  function submit(word?: string) {
    const answer = (word ?? typed.join('')).toUpperCase().trim()
    if (!answer) return
    const correct = answer === target
    if (!correct) triggerShake()
    onAnswer(correct)
  }

  const isComplete = typed.length === target.length

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-sm mx-auto">

      {/* Emoji hint — tap to hear word */}
      <button
        onClick={() => speak(question.word.word)}
        className="text-7xl leading-none hover:scale-110 active:scale-95 transition-transform"
        title="Hør ordet"
        aria-label="Hør ordet"
      >
        {question.word.emoji}
      </button>

      

      {/* Answer slots */}
      <div className={`flex gap-1.5 flex-wrap justify-center ${shake ? 'shake' : ''}`}>
        {Array.from({ length: target.length }).map((_, i) => (
          <div
            key={i}
            className={`w-10 h-12 rounded-xl border-2 flex items-center justify-center
                        text-xl font-black transition-all select-none
                        ${typed[i]
                          ? 'bg-purple-600/30 border-purple-400/60 text-white'
                          : 'bg-white/5 border-white/20 text-white/20'
                        }`}
          >
            {typed[i] ?? '·'}
          </div>
        ))}
      </div>

      {inputMode === 'buttons' ? (
        <>
          {/* Letter tile grid */}
          <div className="flex flex-wrap gap-2 justify-center max-w-xs">
            {tiles.map(tile => (
              <button
                key={tile.id}
                disabled={disabled || tile.used}
                onClick={() => tapTile(tile)}
                className={`w-11 h-11 rounded-xl text-lg font-black transition-all
                  border-2 select-none
                  ${tile.used
                    ? 'bg-white/5 border-white/5 text-white/0 cursor-not-allowed'
                    : 'bg-white/15 border-white/25 text-white hover:bg-purple-600/30 hover:border-purple-400/50 active:scale-90'
                  }`}
              >
                {tile.letter}
              </button>
            ))}
          </div>

          {/* Backspace + Submit row */}
          <div className="flex gap-3 w-full">
            <button
              onClick={backspace}
              disabled={disabled || !typed.length}
              className="flex-1 py-3 rounded-2xl bg-white/10 border border-white/20
                         text-white font-bold text-xl hover:bg-white/20 active:scale-95
                         transition disabled:opacity-30"
              aria-label="Slett"
            >
              ⌫
            </button>
            <button
              onClick={() => submit()}
              disabled={disabled || !isComplete}
              className="flex-[2] py-3 rounded-2xl bg-purple-600 border border-purple-500
                         text-white font-black text-lg hover:bg-purple-500 active:scale-95
                         transition disabled:opacity-30"
            >
              Svar ✓
            </button>
          </div>
        </>
      ) : (
        <>
          {/* Keyboard text input */}
          <input
            ref={inputRef}
            value={kbValue}
            onChange={e => setKbValue(e.target.value.toUpperCase())}
            onKeyDown={e => { if (e.key === 'Enter') submit(kbValue) }}
            disabled={disabled}
            maxLength={target.length + 3}
            placeholder="Skriv svaret…"
            className="w-full py-4 px-5 rounded-2xl bg-white/10 border-2 border-white/20
                       text-white text-2xl font-black text-center uppercase tracking-widest
                       placeholder:text-white/25 focus:outline-none focus:border-purple-400/70
                       disabled:opacity-50"
          />

          <button
            onClick={() => submit(kbValue)}
            disabled={disabled || !kbValue.trim()}
            className="w-full py-3 rounded-2xl bg-purple-600 border border-purple-500
                       text-white font-black text-lg hover:bg-purple-500 active:scale-95
                       transition disabled:opacity-30"
          >
            Svar ✓
          </button>
        </>
          )}
          
          {/* Mode toggle — segmented radio control */}
        <div className="flex w-full rounded-2xl overflow-hidden border border-white/15 text-sm font-bold">
            <button
            onClick={() => !disabled && switchMode('buttons')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 transition-colors
                ${inputMode === 'buttons'
                ? 'bg-purple-600 text-white'
                : 'bg-white/5 text-[var(--muted)] hover:bg-white/10'
                }`}
            >
            🔤 Knapper
            </button>
            <div className="w-px bg-white/15" />
            <button
            onClick={() => !disabled && switchMode('keyboard')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 transition-colors
                ${inputMode === 'keyboard'
                ? 'bg-purple-600 text-white'
                : 'bg-white/5 text-[var(--muted)] hover:bg-white/10'
                }`}
            >
          ⌨️ Tastatur
        </button>
      </div>
    </div>
  )
}
