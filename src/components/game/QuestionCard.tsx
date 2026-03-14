import type { Question } from '@/content/types'
import WordToImage from './WordToImage'
import ImageToWord from './ImageToWord'
import FillIn from './FillIn'
import Punctuation from './Punctuation'
import WordOrder from './WordOrder'
import SpellIt from './SpellIt'
import SynonymGame from './SynonymGame'

interface Props {
  question: Question
  onAnswer: (correct: boolean) => void
  disabled: boolean
}

export default function QuestionCard({ question, onAnswer, disabled }: Props) {
  switch (question.type) {
    case 'word_to_image':
      return <WordToImage question={question} onAnswer={onAnswer} disabled={disabled} />
    case 'image_to_word':
      return <ImageToWord question={question} onAnswer={onAnswer} disabled={disabled} />
    case 'fill_in':
      return <FillIn question={question} onAnswer={onAnswer} disabled={disabled} />
    case 'punctuation':
      return <Punctuation question={question} onAnswer={onAnswer} disabled={disabled} />
    case 'word_order':
      return <WordOrder question={question} onAnswer={onAnswer} disabled={disabled} />
    case 'comprehension':
      // Shown as fill_in style: passage + question + 3 choices
      return (
        <div className="flex flex-col items-center gap-5 w-full">
          <p className="text-base font-bold tracking-wide text-[var(--muted)]">Les og forstå</p>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 max-w-sm text-white text-xl leading-relaxed">
            {question.passage}
          </div>
          <p className="text-lg font-bold text-white text-center max-w-sm">{question.question}</p>
          <div className="flex flex-col gap-3 w-full max-w-sm">
            {question.choices.map((choice) => (
              <button
                key={choice}
                disabled={disabled}
                onClick={() => onAnswer(choice === question.correct)}
                className="w-full py-4 px-6 rounded-2xl bg-white/10 border-2 border-white/20
                           text-white text-lg font-bold text-center
                           hover:bg-white/20 active:scale-[0.98] transition-all
                           disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {choice}
              </button>
            ))}
          </div>
        </div>
      )
    case 'spell_it':
      return <SpellIt question={question} onAnswer={onAnswer} disabled={disabled} />
    case 'synonym':
      return <SynonymGame question={question} onAnswer={onAnswer} disabled={disabled} />
    case 'antonym':
      return <SynonymGame question={question} onAnswer={onAnswer} disabled={disabled} />
  }
}
