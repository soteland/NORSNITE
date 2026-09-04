export type QuestionType =
  | 'word_to_image'
  | 'image_to_word'
  | 'fill_in'
  | 'word_order'
  | 'comprehension'
  | 'spell_it'
  | 'punctuation'
  | 'synonym'
  | 'antonym'
  | 'rhyme'
  | 'double_consonant'
  | 'word_recognition'

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

// Choose the synonym (same meaning) for the given word
export interface SynonymQuestion {
  type: 'synonym'
  id: string
  difficulty: number
  word: string       // the word to find a synonym for
  correct: string    // the correct synonym
  choices: string[]  // includes correct; shuffle at runtime
}

// Choose the antonym (opposite meaning) for the given word
export interface AntonymQuestion {
  type: 'antonym'
  id: string
  difficulty: number
  word: string       // the word to find an antonym for
  correct: string    // the correct antonym
  choices: string[]  // includes correct; shuffle at runtime
}

// Choose the word that rhymes with the given word
export interface RhymeQuestion {
  type: 'rhyme'
  id: string
  difficulty: number
  word: string       // the word to find a rhyme for
  correct: string    // the correct rhyme
  choices: string[]  // includes correct; shuffle at runtime
}

// Pick the correctly spelled word for a sentence: single vs double consonant
// ("Jeg ___ hjem" → løper / løpper). Deliberately only two choices — the
// single/double contrast IS the exercise.
export interface DoubleConsonantQuestion {
  type: 'double_consonant'
  id: string
  difficulty: number
  sentence: string        // contains ___ for the blank
  correct: string         // correctly spelled form
  wrong: string           // the other spelling
  choices: string[]       // [correct, wrong] in shuffled display order
  teachingNote: string    // brief Norwegian spelling tip
}

// Word recognition: a target word on top, three visually similar words below
// (mørk / mark / melk), tap the matching one. Pure fast-recognition drill for
// readers who decode letter by letter.
//
// The three options are rendered at three DIFFERENT text sizes, shuffled per
// question, so the word cannot be matched on width or shape — it has to be
// read. `sizeOrder` is a permutation of 0-2 indexing the size scale in
// WordRecognition.tsx, aligned positionally with `choices`.
export interface WordRecognitionQuestion {
  type: 'word_recognition'
  id: string
  difficulty: number
  target: string          // shown on top; always one of `choices`
  choices: string[]       // the three similar words, in shuffled display order
  sizeOrder: number[]     // permutation of 0-2 → text size per choice
}

export type Question =
  | WordToImageQuestion
  | ImageToWordQuestion
  | FillInQuestion
  | WordOrderQuestion
  | ComprehensionQuestion
  | SpellItQuestion
  | PunctuationQuestion
  | SynonymQuestion
  | AntonymQuestion
  | RhymeQuestion
  | DoubleConsonantQuestion
  | WordRecognitionQuestion
