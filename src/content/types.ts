export type QuestionType =
  | 'word_to_image'
  | 'image_to_word'
  | 'fill_in'
  | 'word_order'
  | 'comprehension'
  | 'spell_it'
  | 'punctuation'

export interface Word {
  id: string
  word: string
  emoji: string           // used as image placeholder until real images arrive
  category: string        // e.g. 'dyr', 'mat', 'kropp', 'natur'
  difficulty: number      // 1-10
}

// Choose the image that matches the spoken/shown word
export interface WordToImageQuestion {
  type: 'word_to_image'
  id: string
  difficulty: number
  word: Word
  choices: Word[]         // includes correct word; shuffle at runtime
}

// Choose the word that matches the shown image
export interface ImageToWordQuestion {
  type: 'image_to_word'
  id: string
  difficulty: number
  target: Word
  choices: Word[]         // includes correct word; shuffle at runtime
}

// Fill in the blank: pick the correct word for a sentence
export interface FillInQuestion {
  type: 'fill_in'
  id: string
  difficulty: number
  sentence: string        // contains ___ for blank
  correct: string
  choices: string[]       // includes correct; shuffle at runtime
}

// Arrange tiles into correct word order
export interface WordOrderQuestion {
  type: 'word_order'
  id: string
  difficulty: number
  correct: string[]       // correct sentence order; tiles are derived by shuffling at runtime
}

// Read a short text, answer a multiple-choice question
export interface ComprehensionQuestion {
  type: 'comprehension'
  id: string
  difficulty: number
  passage: string
  question: string
  correct: string
  choices: string[]       // includes correct; shuffle at runtime
}

// Spell a word correctly (type it out)
export interface SpellItQuestion {
  type: 'spell_it'
  id: string
  difficulty: number
  word: Word
  hint?: string
}

// Choose the correct punctuation mark for the sentence
export interface PunctuationQuestion {
  type: 'punctuation'
  id: string
  difficulty: number
  sentence: string        // sentence WITHOUT final punctuation
  correct: '.' | '?' | '!'
  choices: ('.' | '?' | '!')[]
  teachingNote: string    // brief Norwegian grammar tip
}

export type Question =
  | WordToImageQuestion
  | ImageToWordQuestion
  | FillInQuestion
  | WordOrderQuestion
  | ComprehensionQuestion
  | SpellItQuestion
  | PunctuationQuestion
